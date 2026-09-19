import mongoose from "mongoose";

const loadSchema = new mongoose.Schema(
  {
    shipperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    originCity: {
      type: String,
      required: true,
      trim: true,
    },
    originAddress: {
      type: String,
      default: "",
    },
    destinationCity: {
      type: String,
      required: true,
      trim: true,
    },
    destinationAddress: {
      type: String,
      default: "",
    },
    distanceKm: {
      type: Number,
      required: true,
      default: 500,
    },
    cargoType: {
      type: String,
      required: true,
      enum: [
        "FMCG & Consumer Goods",
        "Industrial Machinery & Parts",
        "Textiles & Garments",
        "Agriculture & Perishables",
        "Electronics & Appliances",
        "Construction & Steel Materials",
        "Chemicals & Pharma",
        "Other General Freight",
      ],
      default: "FMCG & Consumer Goods",
    },
    weightTons: {
      type: Number,
      required: true,
      min: 0.1,
    },
    truckTypeNeeded: {
      type: String,
      required: true,
      default: "14ft Open Body (3-4 Ton)",
    },
    budget: {
      type: Number,
      required: true,
      min: 500,
    },
    pickupDate: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    deliveryDeadline: {
      type: Date,
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["POSTED", "BIDDING", "BOOKED", "IN_TRANSIT", "DELIVERED", "CANCELLED"],
      default: "POSTED",
    },
  },
  {
    timestamps: true,
  }
);

export const Load = mongoose.model("Load", loadSchema);
