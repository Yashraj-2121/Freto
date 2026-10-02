import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app.js";
// MongoDB imports removed

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  console.log("==================================================");
  console.log("🚚 Starting FRETO Freight & Truck Booking Server");
  console.log("==================================================");

  // MongoDB has been removed! We now rely on Supabase.
  console.log("ℹ️ Using Supabase Postgres for Database & Auth!");

  // 3. Create Express app & HTTP Server
  const app = createApp();
  const httpServer = http.createServer(app);

  // 4. Socket.io for Real-time GPS & Telemetry
  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    socket.on("join-trip", (tripId) => {
      socket.join(`trip:${tripId}`);
    });

    socket.on("driver-location-update", (data) => {
      if (data?.tripId) {
        io.to(`trip:${data.tripId}`).emit("location-updated", data);
      }
    });
  });

  const port = process.env.PORT || 8000;
  httpServer.listen(port, () => {
    console.log(`🚀 FRETO API Server running at http://localhost:${port}`);
    console.log(`📡 Health Check: http://localhost:${port}/api/health`);
  });
}

main().catch((err) => {
  console.error("❌ Fatal Server Startup Error:", err);
  process.exit(1);
});
