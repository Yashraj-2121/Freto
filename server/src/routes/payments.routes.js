import { Router } from "express";
import express from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { authenticate, requireRole } from "../middleware/auth.js";
import { asyncHandler, AppError } from "../middleware/error.js";
import * as paymentsService from "../services/paymentsService.js";

const router = Router();

router.post(
  "/orders",
  express.json(),
  authenticate,
  requireRole("SHIPPER"),
  asyncHandler(async (req, res) => {
    const { bookingId, idempotencyKey } = z
      .object({ bookingId: z.string(), idempotencyKey: z.string().default(() => nanoid()) })
      .parse(req.body);
    res.status(201).json(await paymentsService.createPaymentOrder(bookingId, idempotencyKey));
  }),
);

// Webhook needs the raw request body to verify the HMAC signature, so this
// route uses express.raw() instead of the app-wide express.json() parser —
// mounted separately in app.js *before* the JSON body parser runs on it.
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    if (!paymentsService.verifyWebhookSignature(req.body, signature)) {
      throw new AppError(401, "Invalid webhook signature");
    }
    const payload = JSON.parse(req.body.toString("utf8"));
    await paymentsService.handlePaymentWebhook(payload);
    res.json({ received: true });
  }),
);

router.post(
  "/payouts/:bookingId/trigger",
  express.json(),
  authenticate,
  requireRole("ADMIN", "FINANCE"),
  asyncHandler(async (req, res) => {
    res.json(await paymentsService.triggerPayout(req.params.bookingId));
  }),
);

export default router;
