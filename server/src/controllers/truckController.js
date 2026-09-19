import { Truck } from "../models/Truck.js";

export async function getTrucks(req, res) {
  try {
    const { transporterId, status, city, type } = req.query;
    const filter = {};

    if (transporterId) filter.transporterId = transporterId;
    if (status) filter.status = status;
    if (city) filter.currentCity = new RegExp(city, "i");
    if (type) filter.truckType = type;

    const trucks = await Truck.find(filter)
      .populate("transporterId", "name email phone companyName")
      .sort({ createdAt: -1 });

    res.json({ count: trucks.length, trucks });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trucks", error: error.message });
  }
}

export async function getTruckById(req, res) {
  try {
    const truck = await Truck.findById(req.params.id).populate(
      "transporterId",
      "name email phone companyName"
    );
    if (!truck) return res.status(404).json({ message: "Truck not found" });
    res.json({ truck });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch truck", error: error.message });
  }
}

export async function createTruck(req, res) {
  try {
    const {
      truckNumber,
      truckType,
      capacityTons,
      baseRatePerKm,
      driverName,
      driverPhone,
      currentCity,
      status,
    } = req.body;

    let transporterId = req.user ? req.user._id : req.body.transporterId;
    if (!transporterId) {
      const defaultTransporter = await User.findOne({ role: "TRANSPORTER" });
      transporterId = defaultTransporter?._id;
    }

    if (!truckNumber || !truckType || !capacityTons) {
      return res.status(400).json({ message: "Truck number, type, and capacity are required." });
    }

    const existingTruck = await Truck.findOne({ truckNumber: truckNumber.toUpperCase() });
    if (existingTruck) {
      return res.status(400).json({ message: "A truck with this registration number already exists." });
    }

    const truck = await Truck.create({
      transporterId,
      truckNumber: truckNumber.toUpperCase(),
      truckType,
      capacityTons,
      baseRatePerKm: baseRatePerKm || 35,
      driverName: driverName || "Assigned Driver",
      driverPhone: driverPhone || "+91 98765 43210",
      currentCity: currentCity || "Mumbai",
      status: status || "Available",
    });

    res.status(201).json({ message: "Truck added to fleet successfully", truck });
  } catch (error) {
    res.status(500).json({ message: "Failed to create truck", error: error.message });
  }
}

export async function updateTruck(req, res) {
  try {
    const truck = await Truck.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!truck) return res.status(404).json({ message: "Truck not found" });
    res.json({ message: "Truck updated successfully", truck });
  } catch (error) {
    res.status(500).json({ message: "Failed to update truck", error: error.message });
  }
}

export async function deleteTruck(req, res) {
  try {
    const truck = await Truck.findByIdAndDelete(req.params.id);
    if (!truck) return res.status(404).json({ message: "Truck not found" });
    res.json({ message: "Truck removed from fleet successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete truck", error: error.message });
  }
}
