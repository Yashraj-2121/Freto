import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    truckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
      required: true,
    },
    driverName: {
      type: String,
      required: true,
    },
    driverPhone: {
      type: String,
      required: true,
    },
    originCity: {
      type: String,
      required: true,
    },
    destinationCity: {
      type: String,
      required: true,
    },
    currentCoordinates: {
      lat: { type: Number, default: 19.076 }, // default Mumbai
      lng: { type: Number, default: 72.8777 },
    },
    originCoordinates: {
      lat: { type: Number, default: 19.076 },
      lng: { type: Number, default: 72.8777 },
    },
    destinationCoordinates: {
      lat: { type: Number, default: 28.6139 }, // default Delhi
      lng: { type: Number, default: 77.209 },
    },
    progressPercent: {
      type: Number,
      default: 15,
      min: 0,
      max: 100,
    },
    speedKmH: {
      type: Number,
      default: 55,
    },
    status: {
      type: String,
      enum: ["DISPATCHED", "IN_TRANSIT", "REACHED_DESTINATION", "DELIVERED"],
      default: "IN_TRANSIT",
    },
    estimatedArrival: {
      type: String,
      default: "Today, 8:30 PM",
    },
    routeHistory: [
      {
        lat: Number,
        lng: Number,
        timestamp: { type: Date, default: Date.now },
        statusNote: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Trip = mongoose.model("Trip", tripSchema);
