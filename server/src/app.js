import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import trucksRoutes from "./routes/trucks.routes.js";
import loadsRoutes from "./routes/loads.routes.js";
import bidsRoutes from "./routes/bids.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import tripsRoutes from "./routes/trips.routes.js";
import calculatorRoutes from "./routes/calculator.routes.js";
import adminRoutes from "./routes/admin.routes.js";

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors({ origin: "*", credentials: true }));
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "online",
      project: "FRETO Freight & Truck Booking Platform",
      stack: "MERN (MongoDB, Express, React, Node.js)",
      timestamp: new Date().toISOString(),
    });
  });

  // REST API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/trucks", trucksRoutes);
  app.use("/api/loads", loadsRoutes);
  app.use("/api/bids", bidsRoutes);
  app.use("/api/bookings", bookingsRoutes);
  app.use("/api/trips", tripsRoutes);
  app.use("/api/calculator", calculatorRoutes);
  app.use("/api/admin", adminRoutes);

  // 404 handler for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found on FRETO API.` });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message || "An unexpected error occurred.",
    });
  });

  return app;
}
