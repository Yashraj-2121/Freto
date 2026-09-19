import mongoose from "mongoose";

const truckSchema = new mongoose.Schema(
  {
    transporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    truckNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    truckType: {
      type: String,
      required: true,
      enum: [
        "Mini Truck / Tata Ace (1-2 Ton)",
        "14ft Open Body (3-4 Ton)",
        "19ft Container (7-8 Ton)",
        "24ft Multi-Axle (10-12 Ton)",
        "32ft Multi-Axle (15-20 Ton)",
        "Refrigerated Container (5-10 Ton)",
        "Flatbed Trailer (25+ Ton)",
      ],
      default: "14ft Open Body (3-4 Ton)",
    },
    capacityTons: {
      type: Number,
      required: true,
      min: 0.5,
    },
    baseRatePerKm: {
      type: Number,
      required: true,
      default: 35,
    },
    driverName: {
      type: String,
      required: true,
      default: "Ramesh Kumar",
    },
    driverPhone: {
      type: String,
      required: true,
      default: "+91 98765 43210",
    },
    currentCity: {
      type: String,
      required: true,
      default: "Mumbai",
    },
    status: {
      type: String,
      enum: ["Available", "On Trip", "Maintenance"],
      default: "Available",
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Truck = mongoose.model("Truck", truckSchema);
