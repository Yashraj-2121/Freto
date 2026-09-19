import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { authenticate, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
import * as trackingService from "../services/trackingService.js";

const router = Router({ mergeParams: true });
const pingLimiter = rateLimit({ windowMs: 60_000, max: 30 }); // ~1 ping/2s per driver

router.post(
  "/",
  authenticate,
  requireRole("DRIVER"),
  pingLimiter,
  asyncHandler(async (req, res) => {
    const dto = z
      .object({
        lat: z.number(),
        lng: z.number(),
        speedKmh: z.number().optional(),
        recordedAt: z.string(),
      })
      .parse(req.body);
    res.status(201).json(await trackingService.ingestPing(req.user.id, req.params.tripId, dto));
  }),
);

router.get(
  "/latest",
  authenticate,
  requireRole("DRIVER", "SHIPPER", "TRANSPORTER", "ADMIN", "OPERATIONS"),
  asyncHandler(async (req, res) => {
    res.json(await trackingService.latestPing(req.params.tripId));
  }),
);

router.get(
  "/trail",
  authenticate,
  requireRole("DRIVER", "SHIPPER", "TRANSPORTER", "ADMIN", "OPERATIONS"),
  asyncHandler(async (req, res) => {
    res.json(await trackingService.trail(req.params.tripId));
  }),
);

export default router;
