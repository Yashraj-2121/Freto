import crypto from "crypto";
import Razorpay from "razorpay";
import { pgSequelize } from "../config/postgres.js";
import { Payment, Payout, Booking, Bid, Load } from "../models/postgres/index.js";
import { sendNotification } from "./notificationsService.js";
import { AppError } from "../middleware/error.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummykeyid",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummysecret",
});

/**
 * Creates a Payment row up front with a caller-supplied idempotency key, so
 * a retried request (double-tap, network retry) can never create two
 * payment attempts for the same intent — the unique constraint on
 * idempotencyKey does the enforcement at the DB level.
 */
export async function createPaymentOrder(bookingId, idempotencyKey) {
  const existing = await Payment.findOne({ where: { idempotencyKey } });
  if (existing) return toOrderResponse(existing); // safe retry — return the same order

  const booking = await Booking.findByPk(bookingId);
  if (!booking) throw new AppError(404, "Booking not found");

  const payment = await Payment.create({
    bookingId,
    amountPaise: booking.agreedPricePaise,
    status: "PENDING",
    idempotencyKey,
  });

  const order = await razorpay.orders.create({
    amount: payment.amountPaise,
    currency: "INR",
    receipt: payment.id,
  });

  await payment.update({ providerRef: order.id });

  return toOrderResponse(payment);
}

function toOrderResponse(payment) {
  return {
    paymentId: payment.id,
    providerOrderId: payment.providerRef,
    amountPaise: payment.amountPaise,
    status: payment.status,
  };
}

/**
 * Verifies the provider's webhook signature (HMAC-SHA256 over the raw body,
 * a standard pattern for Razorpay/Cashfree-style webhooks) before trusting
 * anything in the payload.
 */
export function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "dummywebhooksecret";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  // Constant-time comparison — a naive === here would leak timing info.
  return (
    signature?.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  );
}

/**
 * Idempotent webhook handler: looks up the Payment by providerRef, and if
 * it's already in a terminal state, does nothing — providers routinely
 * redeliver the same webhook multiple times.
 */
export async function handlePaymentWebhook(payload) {
  const event = payload.event;
  if (!["payment.captured", "payment.failed"].includes(event)) {
    return null; // Ignore other events for now
  }

  const paymentEntity = payload.payload.payment.entity;
  const providerOrderId = paymentEntity.order_id;
  const nextStatus = event === "payment.captured" ? "SUCCEEDED" : "FAILED";

  const payment = await Payment.findOne({ where: { providerRef: providerOrderId } });
  if (!payment) throw new AppError(404, "Unknown payment order");

  if (["SUCCEEDED", "FAILED", "REFUNDED"].includes(payment.status)) {
    return payment; // already settled — ignore the redelivered webhook
  }

  await payment.update({ status: nextStatus });

  const booking = await Booking.findByPk(payment.bookingId, { include: [Bid] });
  if (booking) {
    await sendNotification({
      userId: booking.Bid.transporterOrgId, // in a real system, resolve to a specific user
      channel: "SMS",
      template: nextStatus === "SUCCEEDED" ? "payment_received" : "payment_failed",
      recipient: "unknown", // resolve from the org's contact phone in a full implementation
      payload: { bookingId: booking.id, amountPaise: payment.amountPaise },
    });
  }

  return payment;
}

/**
 * Triggers a payout to the transporter once a trip completes. Runs inside a
 * transaction and is itself idempotent per booking (unique idempotencyKey),
 * so it's safe to call both automatically (on trip completion) and manually
 * from an ops/finance retry endpoint without double-paying.
 */
export async function triggerPayout(bookingId) {
  return pgSequelize.transaction(async (t) => {
    const existing = await Payout.findOne({ where: { idempotencyKey: `payout_${bookingId}` }, transaction: t });
    if (existing) return existing;

    const booking = await Booking.findByPk(bookingId, { include: [Bid, Load], transaction: t });
    if (!booking) throw new AppError(404, "Booking not found");
    if (booking.status !== "COMPLETED") {
      throw new AppError(400, "Cannot payout a booking that has not completed");
    }

    const payout = await Payout.create(
      {
        bookingId,
        transporterOrgId: booking.Bid.transporterOrgId,
        amountPaise: booking.agreedPricePaise,
        status: "PENDING",
        idempotencyKey: `payout_${bookingId}`,
      },
      { transaction: t },
    );

    // TODO: call the real payout API (Razorpay Route / Cashfree Payouts).
    await payout.update({ status: "PROCESSING", providerRef: `payout_stub_${payout.id}` }, { transaction: t });

    return payout;
  });
}
