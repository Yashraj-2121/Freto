import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xssClean from "xss-clean";

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

  // 1. Security Headers (Helmet)
  app.use(helmet());
  app.disable("x-powered-by"); // Extra safety to hide Express

  // 2. Strict CORS
  app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "apikey"]
  }));

  // 3. Global Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per windowMs
    message: { message: "Too many requests from this IP, please try again later." },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
  app.use("/api", limiter);

  // 4. Body Parser with Size Limit
  app.use(express.json({ limit: "10kb" })); // Prevent large payload attacks
  app.use(xssClean()); // Prevent XSS by sanitizing input fields

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
