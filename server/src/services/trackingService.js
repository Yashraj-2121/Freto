import { Trip, Driver } from "../models/postgres/index.js";
import { TrackingPing } from "../models/mongo/TrackingPing.js";
import { AppError } from "../middleware/error.js";

const TRACKABLE_STATUSES = ["EN_ROUTE_TO_PICKUP", "ARRIVED_AT_PICKUP", "LOADED", "IN_TRANSIT", "ARRIVED_AT_DROP"];

export async function ingestPing(driverUserId, tripId, { lat, lng, speedKmh, recordedAt }) {
  const trip = await Trip.findByPk(tripId, { include: [Driver] });
  if (!trip) throw new AppError(404, "Trip not found");
  if (trip.Driver.userId !== driverUserId) throw new AppError(403, "Forbidden");
  if (!TRACKABLE_STATUSES.includes(trip.status)) {
    throw new AppError(400, `Trip is not currently trackable (status: ${trip.status})`);
  }

  return TrackingPing.create({
    tripId,
    location: { type: "Point", coordinates: [lng, lat] },
    speedKmh,
    recordedAt: new Date(recordedAt),
  });
}

export async function latestPing(tripId) {
  const ping = await TrackingPing.findOne({ tripId }).sort({ recordedAt: -1 });
  if (!ping) throw new AppError(404, "No tracking data yet for this trip");
  return ping;
}

export async function trail(tripId) {
  return TrackingPing.find({ tripId }).sort({ recordedAt: 1 });
}
