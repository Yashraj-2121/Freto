import { Bid } from "../models/Bid.js";
import { Load } from "../models/Load.js";
import { Truck } from "../models/Truck.js";
import { Booking } from "../models/Booking.js";
import { Trip } from "../models/Trip.js";
import { User } from "../models/User.js";

// Coordinates dictionary for Indian logistics hubs
const CITY_COORDINATES = {
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Surat: { lat: 21.1702, lng: 72.8311 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
  Indore: { lat: 22.7196, lng: 75.8577 },
};

export async function getBids(req, res) {
  try {
    const { loadId, transporterId } = req.query;
    const filter = {};
    if (loadId) filter.loadId = loadId;
    if (transporterId) filter.transporterId = transporterId;

    const bids = await Bid.find(filter)
      .populate("loadId")
      .populate("transporterId", "name email phone companyName")
      .populate("truckId")
      .sort({ createdAt: -1 });

    res.json({ count: bids.length, bids });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bids", error: error.message });
  }
}

export async function placeBid(req, res) {
  try {
    const { loadId, truckId, bidAmount, message, estimatedDeliveryHours } = req.body;

    if (!loadId || !truckId || !bidAmount) {
      return res.status(400).json({ message: "Load ID, Truck ID, and Bid Amount are required." });
    }

    const load = await Load.findById(loadId);
    if (!load) return res.status(404).json({ message: "Load not found." });
    if (load.status !== "POSTED" && load.status !== "BIDDING") {
      return res.status(400).json({ message: "This load is no longer accepting bids." });
    }

    const truck = await Truck.findById(truckId);
    if (!truck) return res.status(404).json({ message: "Truck not found." });

    // Resilient transporter identification
    let transporterId = req.user ? req.user._id : req.body.transporterId;
    if (!transporterId && truck.transporterId) {
      transporterId = truck.transporterId;
    }
    if (!transporterId) {
      const defaultTransporter = await User.findOne({ role: "TRANSPORTER" });
      transporterId = defaultTransporter?._id;
    }

    // Check if transporter already placed a bid
    let bid = await Bid.findOne({ loadId, transporterId });
    if (bid) {
      bid.bidAmount = Number(bidAmount);
      bid.truckId = truckId;
      bid.message = message || bid.message;
      bid.estimatedDeliveryHours = estimatedDeliveryHours || 24;
      await bid.save();
    } else {
      bid = await Bid.create({
        loadId,
        transporterId,
        truckId,
        bidAmount: Number(bidAmount),
        message: message || "Available immediately with verified GPS-enabled truck.",
        estimatedDeliveryHours: estimatedDeliveryHours || 24,
      });
    }

    // Update load status to BIDDING
    load.status = "BIDDING";
    await load.save();

    res.status(201).json({ message: "Bid placed successfully", bid });
  } catch (error) {
    console.error("placeBid error:", error);
    res.status(500).json({ message: "Failed to place bid", error: error.message });
  }
}

export async function acceptBid(req, res) {
  try {
    const { bidId } = req.params;
    const bid = await Bid.findById(bidId)
      .populate("loadId")
      .populate("truckId")
      .populate("transporterId");

    if (!bid) return res.status(404).json({ message: "Bid not found" });

    const load = bid.loadId;
    if (!load || load.status === "BOOKED" || load.status === "DELIVERED") {
      return res.status(400).json({ message: "Load is already booked or completed." });
    }

    // 1. Mark this bid as ACCEPTED and all other bids for this load as REJECTED
    bid.status = "ACCEPTED";
    await bid.save();
    await Bid.updateMany({ loadId: load._id, _id: { $ne: bid._id } }, { status: "REJECTED" });

    // 2. Mark load as BOOKED
    load.status = "BOOKED";
    await load.save();

    // 3. Mark truck as On Trip
    if (bid.truckId) {
      bid.truckId.status = "On Trip";
      await bid.truckId.save();
    }

    // 4. Generate clean invoice number & booking reference
    const timestamp = Date.now().toString().slice(-6);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${timestamp}`;
    const bookingReference = `BK-${load.originCity.slice(0, 3).toUpperCase()}-${timestamp}`;

    // 5. Create Booking
    const booking = await Booking.create({
      bookingReference,
      loadId: load._id,
      bidId: bid._id,
      shipperId: load.shipperId,
      transporterId: bid.transporterId?._id || bid.truckId?.transporterId,
      truckId: bid.truckId ? bid.truckId._id : null,
      finalFare: bid.bidAmount,
      invoiceNumber,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentMethod: "Online Card/UPI (Prepaid)",
    });

    // 6. Automatically spin up a Live Trip for tracking!
    const originCoords = CITY_COORDINATES[load.originCity] || { lat: 19.076, lng: 72.8777 };
    const destCoords = CITY_COORDINATES[load.destinationCity] || { lat: 28.6139, lng: 77.209 };

    const trip = await Trip.create({
      bookingId: booking._id,
      truckId: bid.truckId._id,
      driverName: bid.truckId.driverName || "Sardar Singh",
      driverPhone: bid.truckId.driverPhone || "+91 98765 43210",
      originCity: load.originCity,
      destinationCity: load.destinationCity,
      originCoordinates: originCoords,
      destinationCoordinates: destCoords,
      currentCoordinates: {
        lat: originCoords.lat + (destCoords.lat - originCoords.lat) * 0.15,
        lng: originCoords.lng + (destCoords.lng - originCoords.lng) * 0.15,
      },
      progressPercent: 15,
      speedKmH: 60,
      status: "IN_TRANSIT",
      estimatedArrival: "Within 18 hours",
      routeHistory: [
        {
          lat: originCoords.lat,
          lng: originCoords.lng,
          statusNote: `Dispatched from ${load.originCity} Hub`,
        },
      ],
    });

    res.json({
      message: "Bid accepted successfully! Booking confirmed and Trip dispatched.",
      booking,
      trip,
    });
  } catch (error) {
    console.error("acceptBid error:", error);
    res.status(500).json({ message: "Failed to accept bid", error: error.message });
  }
}
