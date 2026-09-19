import { User } from "../models/User.js";
import { Truck } from "../models/Truck.js";
import { Load } from "../models/Load.js";
import { Booking } from "../models/Booking.js";
import { Trip } from "../models/Trip.js";

export async function getAdminStats(req, res) {
  try {
    const [
      totalUsers,
      totalShippers,
      totalTransporters,
      totalDrivers,
      totalTrucks,
      availableTrucks,
      totalLoads,
      activeLoads,
      totalBookings,
      activeTrips,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "SHIPPER" }),
      User.countDocuments({ role: "TRANSPORTER" }),
      User.countDocuments({ role: "DRIVER" }),
      Truck.countDocuments(),
      Truck.countDocuments({ status: "Available" }),
      Load.countDocuments(),
      Load.countDocuments({ status: { $in: ["POSTED", "BIDDING"] } }),
      Booking.countDocuments(),
      Trip.countDocuments({ status: "IN_TRANSIT" }),
    ]);

    // Calculate total Gross Merchandise Value (GMV) / Revenue
    const bookings = await Booking.find({}, "totalAmount finalFare status");
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || b.finalFare || 0), 0);
    const platformCommission = Math.round(totalRevenue * 0.08); // 8% platform fee

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .populate("shipperId", "name companyName")
      .populate("transporterId", "name companyName")
      .populate("truckId", "truckNumber truckType")
      .populate("loadId", "originCity destinationCity cargoType")
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      metrics: {
        totalUsers,
        totalShippers,
        totalTransporters,
        totalDrivers,
        totalTrucks,
        availableTrucks,
        totalLoads,
        activeLoads,
        totalBookings,
        activeTrips,
        totalRevenue,
        platformCommission,
      },
      recentBookings,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin metrics", error: error.message });
  }
}
