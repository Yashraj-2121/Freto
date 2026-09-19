import { Trip } from "../models/Trip.js";
import { Booking } from "../models/Booking.js";
import { Truck } from "../models/Truck.js";

export async function getTripById(req, res) {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("truckId")
      .populate({
        path: "bookingId",
        populate: [
          { path: "shipperId", select: "name companyName phone" },
          { path: "transporterId", select: "name companyName phone" },
          { path: "loadId" },
        ],
      });

    if (!trip) return res.status(404).json({ message: "Trip tracking details not found." });
    res.json({ trip });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trip", error: error.message });
  }
}

export async function getTripByBooking(req, res) {
  try {
    const trip = await Trip.findOne({ bookingId: req.params.bookingId })
      .populate("truckId")
      .populate("bookingId");

    if (!trip) return res.status(404).json({ message: "No active trip found for this booking." });
    res.json({ trip });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trip", error: error.message });
  }
}

// Live simulation step: move truck forward towards destination
export async function simulateTripStep(req, res) {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found." });

    if (trip.status === "DELIVERED" || trip.progressPercent >= 100) {
      return res.json({
        message: "Shipment has already arrived and been delivered!",
        trip,
      });
    }

    // Advance progress by 15-20%
    const nextProgress = Math.min(100, trip.progressPercent + 20);
    const fraction = nextProgress / 100;

    const oLat = trip.originCoordinates?.lat ?? 19.076;
    const oLng = trip.originCoordinates?.lng ?? 72.8777;
    const dLat = trip.destinationCoordinates?.lat ?? 28.6139;
    const dLng = trip.destinationCoordinates?.lng ?? 77.209;

    // Linear interpolation with slight highway road curve simulation
    const curveNoise = Math.sin(fraction * Math.PI) * 0.35;
    const nextLat = Number((oLat + (dLat - oLat) * fraction).toFixed(4));
    const nextLng = Number((oLng + (dLng - oLng) * fraction + curveNoise).toFixed(4));

    trip.progressPercent = nextProgress;
    trip.currentCoordinates = { lat: nextLat, lng: nextLng };

    if (nextProgress >= 100) {
      trip.status = "DELIVERED";
      trip.speedKmH = 0;
      trip.estimatedArrival = "Delivered Just Now";
      trip.routeHistory.push({
        lat: nextLat,
        lng: nextLng,
        timestamp: new Date(),
        statusNote: `Delivered safely at ${trip.destinationCity} Destination Hub`,
      });

      // Also update associated booking and free up truck
      await Booking.findByIdAndUpdate(trip.bookingId, {
        status: "DELIVERED",
        deliveredAt: new Date(),
      });
      if (trip.truckId) {
        await Truck.findByIdAndUpdate(trip.truckId, { status: "Available" });
      }
    } else {
      trip.status = "IN_TRANSIT";
      trip.speedKmH = Math.floor(50 + Math.random() * 25);
      const hoursRemaining = Math.max(1, Math.round((1 - fraction) * 16));
      trip.estimatedArrival = `ETA ~${hoursRemaining} hrs`;
      trip.routeHistory.push({
        lat: nextLat,
        lng: nextLng,
        timestamp: new Date(),
        statusNote: `Passed Waypoint at ${Math.round(nextProgress)}% distance (${trip.speedKmH} km/h)`,
      });
    }

    await trip.save();

    res.json({
      message:
        nextProgress >= 100
          ? "🎉 Truck reached destination! Trip completed."
          : `Truck moved forward to ${Math.round(nextProgress)}% of journey!`,
      trip,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to simulate trip movement", error: error.message });
  }
}
