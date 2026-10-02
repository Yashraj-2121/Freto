import { supabaseAdmin } from "../config/supabase.js";
// import { Truck } from "../models/Truck.js"; // Removed Mongoose Model

function toCamel(obj) {
  if (!obj) return null;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'id') result._id = value;
    else {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      result[camelKey] = value;
    }
  }
  return result;
}

export async function getTrucks(req, res) {
  try {
    const { transporterId, status, city, type } = req.query;
    const userRole = req.user?.user_metadata?.role;
    
    // DRIVERS see only trucks assigned to their registered phone number
    if (userRole === "DRIVER") {
      const phone = req.user?.user_metadata?.phone;
      if (!phone) {
        return res.json({ count: 0, trucks: [] });
      }
      const phoneDigits = phone.replace(/\D/g, '').slice(-10);
      const query = supabaseAdmin
        .from("trucks")
        .select("*")
        .like("driver_phone", `%${phoneDigits}%`)
        .order('created_at', { ascending: false });
        
      const { data: trucks, error } = await query;
      if (error) throw error;
      return res.json({ count: trucks.length, trucks: trucks.map(toCamel) });
    }

    // TRANSPORTERS see their own trucks via RLS
    const supabase = req.supabase || supabaseAdmin;
    let query = supabase.from("trucks").select("*").order('created_at', { ascending: false });

    if (transporterId) query = query.eq("transporter_id", transporterId);
    if (status) query = query.eq("status", status);
    if (city) query = query.ilike("current_city", `%${city}%`);
    if (type) query = query.eq("truck_type", type);

    const { data: trucks, error } = await query;
    if (error) throw error;

    res.json({ count: trucks.length, trucks: trucks.map(toCamel) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trucks", error: error.message });
  }
}

export async function getTruckById(req, res) {
  try {
    const supabase = req.supabase || supabaseAdmin;
    const { data: truck, error } = await supabase.from("trucks").select("*").eq("id", req.params.id).single();
    
    if (error || !truck) return res.status(404).json({ message: "Truck not found" });
    res.json({ truck: toCamel(truck) });
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

    if (!truckNumber || !truckType || !capacityTons) {
      return res.status(400).json({ message: "Truck number, type, and capacity are required." });
    }

    const supabase = req.supabase || supabaseAdmin;
    // req.user.sub is the Supabase Auth UUID
    let transporterId = req.user ? (req.user.sub || req.user.id) : req.body.transporterId;
    
    if (!transporterId) {
      return res.status(401).json({ message: "You must be logged in to create a truck." });
    }

    const { data: truck, error } = await supabase.from("trucks").insert({
      transporter_id: transporterId,
      truck_number: truckNumber.toUpperCase(),
      truck_type: truckType,
      capacity_tons: Number(capacityTons),
      base_rate_per_km: baseRatePerKm ? Number(baseRatePerKm) : 35,
      driver_name: driverName || "Assigned Driver",
      driver_phone: driverPhone || "+91 98765 43210",
      current_city: currentCity || "Mumbai",
      status: status || "Available"
    }).select().single();

    if (error) {
      // Postgres error code 23505 is unique violation
      if (error.code === '23505') {
        return res.status(400).json({ message: "A truck with this registration number already exists." });
      }
      throw error;
    }

    res.status(201).json({ message: "Truck added to fleet successfully", truck: toCamel(truck) });
  } catch (error) {
    res.status(500).json({ message: "Failed to create truck", error: error.message });
  }
}

export async function updateTruck(req, res) {
  try {
    const userRole = req.user?.user_metadata?.role;
    let supabase = req.supabase || supabaseAdmin;
    let authFilters = {};

    if (userRole === "DRIVER") {
      // Drivers bypass RLS but we strictly enforce it belongs to their phone
      supabase = supabaseAdmin;
      const phone = req.user?.user_metadata?.phone;
      if (!phone) return res.status(403).json({ message: "No phone number attached to driver profile" });
      const phoneDigits = phone.replace(/\D/g, '').slice(-10);
      authFilters.driver_phone = phoneDigits; // Note: For exact matches this assumes standard format, but in Postgres we can use like.
      // Wait, Supabase js update().eq doesn't easily let us use `like` dynamically before update.
      // Since it's a direct API call by ID, we'll just verify the truck's driver_phone first.
    }
    
    // Map any incoming camelCase body fields to snake_case for Postgres
    const updateData = { ...req.body };
    if (updateData.truckType) { updateData.truck_type = updateData.truckType; delete updateData.truckType; }
    if (updateData.capacityTons) { updateData.capacity_tons = updateData.capacityTons; delete updateData.capacityTons; }
    if (updateData.baseRatePerKm) { updateData.base_rate_per_km = updateData.baseRatePerKm; delete updateData.baseRatePerKm; }
    if (updateData.driverName) { updateData.driver_name = updateData.driverName; delete updateData.driverName; }
    if (updateData.driverPhone) { updateData.driver_phone = updateData.driverPhone; delete updateData.driverPhone; }
    if (updateData.currentCity) { updateData.current_city = updateData.currentCity; delete updateData.currentCity; }
    
    // If DRIVER, verify ownership first
    if (userRole === "DRIVER") {
        const { data: existing } = await supabase.from("trucks").select("driver_phone").eq("id", req.params.id).single();
        if (!existing) return res.status(404).json({ message: "Truck not found" });
        const existingDigits = (existing.driver_phone || "").replace(/\D/g, '').slice(-10);
        const myDigits = (req.user?.user_metadata?.phone || "").replace(/\D/g, '').slice(-10);
        if (existingDigits !== myDigits) return res.status(403).json({ message: "Unauthorized: Not your truck" });
        
        // Don't let drivers change who the truck belongs to or the base rate
        delete updateData.base_rate_per_km;
        delete updateData.driver_phone;
        delete updateData.driver_name;
    }

    const { data: truck, error } = await supabase.from("trucks").update(updateData).eq("id", req.params.id).select().single();
    
    if (error || !truck) return res.status(404).json({ message: "Truck not found or unauthorized" });
    res.json({ message: "Truck updated successfully", truck: toCamel(truck) });
  } catch (error) {
    res.status(500).json({ message: "Failed to update truck", error: error.message });
  }
}

export async function deleteTruck(req, res) {
  try {
    const supabase = req.supabase || supabaseAdmin;
    const { error } = await supabase.from("trucks").delete().eq("id", req.params.id);
    
    if (error) return res.status(404).json({ message: "Truck not found or unauthorized" });
    res.json({ message: "Truck removed from fleet successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete truck", error: error.message });
  }
}
