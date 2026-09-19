import { Booking } from "../models/Booking.js";
import { Trip } from "../models/Trip.js";
import { Truck } from "../models/Truck.js";

export async function getBookings(req, res) {
  try {
    const { shipperId, transporterId, status } = req.query;
    const filter = {};

    if (shipperId) filter.shipperId = shipperId;
    if (transporterId) filter.transporterId = transporterId;
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("loadId")
      .populate("shipperId", "name email phone companyName")
      .populate("transporterId", "name email phone companyName")
      .populate("truckId")
      .sort({ createdAt: -1 });

    res.json({ count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
}

export async function getBookingById(req, res) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("loadId")
      .populate("shipperId", "name email phone companyName city")
      .populate("transporterId", "name email phone companyName city")
      .populate("truckId");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Also look for associated trip
    const trip = await Trip.findOne({ bookingId: booking._id });

    res.json({ booking, trip });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch booking details", error: error.message });
  }
}

export async function updateBookingStatus(req, res) {
  try {
    const { status, paymentStatus } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    if (status === "DELIVERED") {
      booking.deliveredAt = new Date();
      // Free up the truck
      if (booking.truckId) {
        await Truck.findByIdAndUpdate(booking.truckId, { status: "Available" });
      }
      // Update trip
      await Trip.findOneAndUpdate(
        { bookingId: booking._id },
        { status: "DELIVERED", progressPercent: 100, speedKmH: 0 }
      );
    }

    await booking.save();
    res.json({ message: "Booking updated successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Failed to update booking", error: error.message });
  }
}
