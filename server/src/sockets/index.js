import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import * as trackingService from "../services/trackingService.js";

/**
 * Real-time tracking flow:
 *  - Driver's app connects, authenticates via JWT (same access token used
 *    for REST), and emits "ping:send" with {tripId, lat, lng, speedKmh}.
 *  - The server persists the ping (Mongo) via the same validation path as
 *    the REST fallback endpoint, then broadcasts it to everyone in
 *    room `trip:<tripId>` (shipper/transporter/admin dashboards).
 *  - Viewers join a trip's room with "trip:join" to start receiving pings.
 */
export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.APP_URL ?? "*", credentials: true },
  });

  // Without this, "io.to(room).emit(...)" only reaches sockets connected to
  // *this* process — a driver on instance A would never reach a shipper
  // watching from instance B. The adapter uses Redis pub/sub to broadcast
  // across every instance.
  const pubClient = new Redis(process.env.REDIS_URL);
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Missing auth token"));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: payload.sub, role: payload.role, orgId: payload.orgId };
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("trip:join", (tripId) => {
      socket.join(`trip:${tripId}`);
    });

    socket.on("trip:leave", (tripId) => {
      socket.leave(`trip:${tripId}`);
    });

    socket.on("ping:send", async ({ tripId, lat, lng, speedKmh, recordedAt }, ack) => {
      try {
        if (socket.user.role !== "DRIVER") {
          throw new Error("Only drivers can send location pings");
        }
        const ping = await trackingService.ingestPing(socket.user.id, tripId, {
          lat,
          lng,
          speedKmh,
          recordedAt: recordedAt ?? new Date().toISOString(),
        });

        io.to(`trip:${tripId}`).emit("ping:new", {
          tripId,
          lat,
          lng,
          speedKmh,
          recordedAt: ping.recordedAt,
        });

        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, message: err.message });
      }
    });
  });

  return io;
}
