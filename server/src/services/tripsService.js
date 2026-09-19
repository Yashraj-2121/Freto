import { pgSequelize } from "../config/postgres.js";
import { Trip, Driver, Booking, Load } from "../models/postgres/index.js";
import { AuditLog } from "../models/mongo/AuditLog.js";
import { triggerPayout } from "./paymentsService.js";
import { AppError } from "../middleware/error.js";

const TRIP_TRANSITIONS = {
  ASSIGNED: ["EN_ROUTE_TO_PICKUP", "CANCELLED"],
  EN_ROUTE_TO_PICKUP: ["ARRIVED_AT_PICKUP", "CANCELLED"],
  ARRIVED_AT_PICKUP: ["LOADED", "CANCELLED"],
  LOADED: ["IN_TRANSIT"],
  IN_TRANSIT: ["ARRIVED_AT_DROP"],
  ARRIVED_AT_DROP: ["UNLOADED"],
  UNLOADED: ["POD_UPLOADED"],
  POD_UPLOADED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

const TIMESTAMP_FIELD = {
  EN_ROUTE_TO_PICKUP: "startedAt",
  ARRIVED_AT_PICKUP: "arrivedPickupAt",
  LOADED: "loadedAt",
  ARRIVED_AT_DROP: "arrivedDropAt",
  UNLOADED: "unloadedAt",
  COMPLETED: "completedAt",
};

export async function updateTripStatus(driverUserId, tripId, nextStatus) {
  const result = await pgSequelize.transaction(async (t) => {
    const trip = await Trip.findByPk(tripId, {
      include: [
        { model: Driver, required: true },
        { model: Booking, required: true, include: [{ model: Load, required: true }] },
      ],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!trip) throw new AppError(404, "Trip not found");
    if (trip.Driver.userId !== driverUserId) throw new AppError(403, "Forbidden");

    const allowed = TRIP_TRANSITIONS[trip.status] ?? [];
    if (!allowed.includes(nextStatus)) {
      throw new AppError(400, `Cannot move trip from ${trip.status} to ${nextStatus}`);
    }

    const field = TIMESTAMP_FIELD[nextStatus];
    await trip.update({ status: nextStatus, ...(field ? { [field]: new Date() } : {}) }, { transaction: t });

    if (nextStatus === "UNLOADED") {
      await Load.update({ status: "DELIVERED" }, { where: { id: trip.Booking.loadId }, transaction: t });
    }
    if (nextStatus === "COMPLETED") {
      await Load.update({ status: "COMPLETED" }, { where: { id: trip.Booking.loadId }, transaction: t });
      await Booking.update({ status: "COMPLETED" }, { where: { id: trip.bookingId }, transaction: t });
    }

    return trip;
  });

  // Audit trail lives in Mongo — schema-flexible, append-only, decoupled
  // from the Postgres transaction that just committed.
  await AuditLog.create({
    actorId: driverUserId,
    action: "TRIP_STATUS_CHANGED",
    entityType: "Trip",
    entityId: tripId,
    metadata: { nextStatus },
  });

  // Payout runs in its own transaction, after the trip/load/booking one has
  // committed — a payout failure should never roll back the delivery record.
  if (nextStatus === "COMPLETED") {
    await triggerPayout(result.bookingId);
  }

  return result;
}

export async function getTripById(id) {
  const trip = await Trip.findByPk(id, {
    include: [{ model: Driver }, { model: Booking, include: [Load] }],
  });
  if (!trip) throw new AppError(404, "Trip not found");
  return trip;
}

export async function listTripsForDriver(driverUserId) {
  const driver = await Driver.findOne({ where: { userId: driverUserId } });
  if (!driver) throw new AppError(404, "Driver profile not found");
  return Trip.findAll({
    where: { driverId: driver.id },
    order: [["createdAt", "DESC"]],
    include: [{ model: Booking, include: [Load] }],
  });
}
