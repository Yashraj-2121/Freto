import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/services/notificationsService.js", () => ({
  sendNotification: jest.fn().mockResolvedValue(undefined),
}));

const { Organization, Booking } = await import("../src/models/postgres/index.js");
const loadsService = await import("../src/services/loadsService.js");
const bidsService = await import("../src/services/bidsService.js");
const paymentsService = await import("../src/services/paymentsService.js");
const crypto = await import("crypto");

async function makeCompletableBooking() {
  const shipper = await Organization.create({ legalName: "Pay Test Shipper " + Math.random(), status: "ACTIVE" });
  const transporter = await Organization.create({ legalName: "Pay Test Transporter " + Math.random(), status: "ACTIVE" });

  let load = await loadsService.createLoad(shipper.id, {
    pickupAddress: "A",
    pickupLat: 0,
    pickupLng: 0,
    dropAddress: "B",
    dropLat: 1,
    dropLng: 1,
    vehicleType: "OPEN_TRUCK",
    weightKg: 1000,
    materialType: "Misc",
    pickupWindowStart: new Date().toISOString(),
    pickupWindowEnd: new Date().toISOString(),
  });
  load = await loadsService.transitionLoad(shipper.id, load.id, "POSTED");
  const bid = await bidsService.placeBid(transporter.id, load.id, { amountPaise: 100_000 });
  return bidsService.acceptBid(shipper.id, bid.id);
}

describe("payments service", () => {
  test("creating a payment order twice with the same idempotency key returns the same order", async () => {
    const booking = await makeCompletableBooking();
    const order1 = await paymentsService.createPaymentOrder(booking.id, "same-key");
    const order2 = await paymentsService.createPaymentOrder(booking.id, "same-key");
    expect(order2.paymentId).toBe(order1.paymentId);
  });

  test("webhook signature verification rejects a tampered signature", () => {
    const body = Buffer.from(JSON.stringify({ a: 1 }));
    const validSig = crypto
      .createHmac("sha256", process.env.PAYMENTS_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");
    expect(paymentsService.verifyWebhookSignature(body, validSig)).toBe(true);
    expect(paymentsService.verifyWebhookSignature(body, "0".repeat(64))).toBe(false);
  });

  test("a redelivered webhook for an already-settled payment is a no-op, not an error", async () => {
    const booking = await makeCompletableBooking();
    const order = await paymentsService.createPaymentOrder(booking.id, "redelivery-key");
    const payload = { providerOrderId: order.providerOrderId, status: "captured", providerPaymentId: "pay_1" };

    const first = await paymentsService.handlePaymentWebhook(payload);
    expect(first.status).toBe("SUCCEEDED");

    const redelivered = await paymentsService.handlePaymentWebhook(payload);
    expect(redelivered.status).toBe("SUCCEEDED");
  });

  test("payout cannot be triggered before the booking is completed", async () => {
    const booking = await makeCompletableBooking();
    await expect(paymentsService.triggerPayout(booking.id)).rejects.toMatchObject({ status: 400 });
  });

  test("payout is idempotent per booking", async () => {
    const booking = await makeCompletableBooking();
    await Booking.update({ status: "COMPLETED" }, { where: { id: booking.id } });

    const payout1 = await paymentsService.triggerPayout(booking.id);
    const payout2 = await paymentsService.triggerPayout(booking.id);
    expect(payout2.id).toBe(payout1.id);
    expect(payout1.amountPaise).toBe(100_000);
  });
});
