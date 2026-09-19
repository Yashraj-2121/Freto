import { Load } from "../models/Load.js";
import { Bid } from "../models/Bid.js";
import { User } from "../models/User.js";

export async function getLoads(req, res) {
  try {
    const { origin, destination, status, shipperId, cargoType, minWeight, maxBudget } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (shipperId) filter.shipperId = shipperId;
    if (cargoType) filter.cargoType = cargoType;
    if (origin) filter.originCity = new RegExp(origin, "i");
    if (destination) filter.destinationCity = new RegExp(destination, "i");
    if (minWeight) filter.weightTons = { $gte: Number(minWeight) };
    if (maxBudget) filter.budget = { $lte: Number(maxBudget) };

    const loads = await Load.find(filter)
      .populate("shipperId", "name email phone companyName")
      .sort({ createdAt: -1 });

    res.json({ count: loads.length, loads });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch loads", error: error.message });
  }
}

export async function getLoadById(req, res) {
  try {
    const load = await Load.findById(req.params.id).populate(
      "shipperId",
      "name email phone companyName"
    );
    if (!load) return res.status(404).json({ message: "Load not found" });

    // Also fetch all bids placed on this load
    const bids = await Bid.find({ loadId: load._id })
      .populate("transporterId", "name email phone companyName")
      .populate("truckId", "truckNumber truckType capacityTons driverName driverPhone currentCity")
      .sort({ bidAmount: 1 });

    res.json({ load, bids });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch load details", error: error.message });
  }
}

export async function createLoad(req, res) {
  try {
    const {
      title,
      originCity,
      originAddress,
      destinationCity,
      destinationAddress,
      distanceKm,
      cargoType,
      weightTons,
      truckTypeNeeded,
      budget,
      pickupDate,
      notes,
    } = req.body;

    if (!title || !originCity || !destinationCity || !weightTons || !budget) {
      return res.status(400).json({
        message: "Title, origin, destination, weight, and target budget are required.",
      });
    }

    // Resilient shipper identification
    let shipperId = req.user ? req.user._id : req.body.shipperId;
    if (!shipperId) {
      const defaultShipper = await User.findOne({ role: "SHIPPER" });
      shipperId = defaultShipper?._id;
    }

    const load = await Load.create({
      shipperId,
      title,
      originCity,
      originAddress: originAddress || `${originCity} Industrial Corridor`,
      destinationCity,
      destinationAddress: destinationAddress || `${destinationCity} Logistics Hub`,
      distanceKm: distanceKm || 450,
      cargoType: cargoType || "FMCG & Consumer Goods",
      weightTons: Number(weightTons),
      truckTypeNeeded: truckTypeNeeded || "14ft Open Body (3-4 Ton)",
      budget: Number(budget),
      pickupDate: pickupDate ? new Date(pickupDate) : new Date(Date.now() + 24 * 60 * 60 * 1000),
      notes: notes || "",
      status: "POSTED",
    });

    res.status(201).json({ message: "Freight load posted successfully", load });
  } catch (error) {
    console.error("createLoad error:", error);
    res.status(500).json({ message: "Failed to post freight load", error: error.message });
  }
}

export async function updateLoad(req, res) {
  try {
    const load = await Load.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!load) return res.status(404).json({ message: "Load not found" });
    res.json({ message: "Load updated successfully", load });
  } catch (error) {
    res.status(500).json({ message: "Failed to update load", error: error.message });
  }
}

export async function deleteLoad(req, res) {
  try {
    const load = await Load.findByIdAndDelete(req.params.id);
    if (!load) return res.status(404).json({ message: "Load not found" });
    // Also remove any pending bids on this load
    await Bid.deleteMany({ loadId: req.params.id });
    res.json({ message: "Load cancelled and removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete load", error: error.message });
  }
}
