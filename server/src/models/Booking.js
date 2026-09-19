import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
    },
    loadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Load",
      required: true,
    },
    bidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid",
      required: true,
    },
    shipperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    truckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
      required: true,
    },
    finalFare: {
      type: Number,
      required: true,
    },
    gstAmount: {
      type: Number,
      default: function () {
        return Math.round(this.finalFare * 0.05); // 5% GST for freight
      },
    },
    totalAmount: {
      type: Number,
      default: function () {
        return this.finalFare + (this.gstAmount || Math.round(this.finalFare * 0.05));
      },
    },
    status: {
      type: String,
      enum: ["CONFIRMED", "DISPATCHED", "IN_TRANSIT", "DELIVERED", "CANCELLED"],
      default: "CONFIRMED",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "COD"],
      default: "PAID",
    },
    paymentMethod: {
      type: String,
      default: "Online (Demo / UPI)",
    },
    pickupDate: {
      type: Date,
      default: Date.now,
    },
    deliveredAt: {
      type: Date,
    },
    invoiceNumber: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model("Booking", bookingSchema);
