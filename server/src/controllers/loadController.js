import { supabaseAdmin } from "../config/supabase.js";
// import { Load } from "../models/Load.js"; // Removed Mongoose Load Model!

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

export async function getLoads(req, res) {
  try {
    const { origin, destination, status, shipperId, cargoType, minWeight, maxBudget } = req.query;
    
    // Use the authenticated user's client if available, fallback to Admin
    const supabase = req.supabase || supabaseAdmin;

    let query = supabase.from("loads").select(`*`).order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (shipperId) query = query.eq('shipper_id', shipperId);
    if (cargoType) query = query.eq('cargo_type', cargoType);
    if (origin) query = query.ilike('origin_city', `%${origin}%`);
    if (destination) query = query.ilike('destination_city', `%${destination}%`);
    if (minWeight) query = query.gte('weight_tons', Number(minWeight));
    if (maxBudget) query = query.lte('budget', Number(maxBudget));

    const { data: loads, error } = await query;
    if (error) throw error;

    res.json({ count: loads.length, loads: loads.map(toCamel) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch loads", error: error.message });
  }
}

export async function getLoadById(req, res) {
  try {
    const supabase = req.supabase || supabaseAdmin;
    
    const { data: load, error } = await supabase.from('loads').select('*').eq('id', req.params.id).single();
    if (error || !load) return res.status(404).json({ message: "Load not found" });

    // Also fetch all bids placed on this load from Supabase
    const { data: bidsData, error: bidsErr } = await supabase
      .from('bids')
      .select(`
        *,
        truck:truck_id (*)
      `)
      .eq('load_id', req.params.id)
      .order('bid_amount', { ascending: true });

    let formattedBids = [];
    if (!bidsErr && bidsData) {
      formattedBids = bidsData.map(bid => {
        const camelBid = toCamel(bid);
        if (camelBid.truck) {
          camelBid.truckId = toCamel(camelBid.truck);
          delete camelBid.truck;
        }
        return camelBid;
      });
    }

    res.json({ load: toCamel(load), bids: formattedBids });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch load details", error: error.message });
  }
}

export async function createLoad(req, res) {
  try {
    const {
      title, originCity, originAddress, destinationCity, destinationAddress,
      distanceKm, cargoType, weightTons, truckTypeNeeded, budget, pickupDate, notes,
    } = req.body;

    if (!title || !originCity || !destinationCity || !weightTons || !budget) {
      return res.status(400).json({ message: "Title, origin, destination, weight, and target budget are required." });
    }

    const supabase = req.supabase || supabaseAdmin;
    let shipperId = req.user ? (req.user.sub || req.user.id) : req.body.shipperId;
    
    const { data: load, error } = await supabase.from('loads').insert({
      shipper_id: shipperId,
      title,
      origin_city: originCity,
      origin_address: originAddress || `${originCity} Industrial Corridor`,
      destination_city: destinationCity,
      destination_address: destinationAddress || `${destinationCity} Logistics Hub`,
      distance_km: distanceKm || 450,
      cargo_type: cargoType || "FMCG & Consumer Goods",
      weight_tons: Number(weightTons),
      truck_type_needed: truckTypeNeeded || "14ft Open Body (3-4 Ton)",
      budget: Number(budget),
      pickup_date: pickupDate ? new Date(pickupDate) : new Date(Date.now() + 24 * 60 * 60 * 1000),
      notes: notes || "",
      status: "POSTED",
    }).select().single();

    if (error) throw error;

    res.status(201).json({ message: "Freight load posted successfully", load: toCamel(load) });
  } catch (error) {
    res.status(500).json({ message: "Failed to post freight load", error: error.message });
  }
}

export async function updateLoad(req, res) {
  try {
    const supabase = req.supabase || supabaseAdmin;
    
    // Convert Javascript camelCase to Postgres snake_case for the update
    const updateData = {};
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.notes) updateData.notes = req.body.notes;
    
    const { data: load, error } = await supabase.from('loads')
      .update(updateData)
      .eq('id', req.params.id)
      .select().single();

    if (error || !load) return res.status(404).json({ message: "Load not found or unauthorized" });
    res.json({ message: "Load updated successfully", load: toCamel(load) });
  } catch (error) {
    res.status(500).json({ message: "Failed to update load", error: error.message });
  }
}

export async function deleteLoad(req, res) {
  try {
    const supabase = req.supabase || supabaseAdmin;
    const { error } = await supabase.from('loads').delete().eq('id', req.params.id);
    
    if (error) return res.status(404).json({ message: "Load not found or unauthorized to delete" });
    
    // Also remove any pending bids on this load from MongoDB
    await Bid.deleteMany({ loadId: req.params.id });
    res.json({ message: "Load cancelled and removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete load", error: error.message });
  }
}
