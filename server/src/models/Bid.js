import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    loadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Load",
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
    bidAmount: {
      type: Number,
      required: true,
      min: 100,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    message: {
      type: String,
      default: "",
    },
    estimatedDeliveryHours: {
      type: Number,
      default: 24,
    },
  },
  {
    timestamps: true,
  }
);

export const Bid = mongoose.model("Bid", bidSchema);
