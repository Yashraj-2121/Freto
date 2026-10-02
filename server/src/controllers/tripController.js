import { supabaseAdmin } from "../config/supabase.js";

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

export async function getTripById(req, res) {
  try {
    const supabase = req.supabase || supabaseAdmin;
    const { data: trip, error } = await supabase.from("trips").select(`
      *,
      truck:truck_id (*),
      booking:booking_id (*)
    `).eq("id", req.params.id).single();

    if (error || !trip) return res.status(404).json({ message: "Trip tracking details not found." });

    const camelTrip = toCamel(trip);
    if (camelTrip.truck) { camelTrip.truckId = toCamel(camelTrip.truck); delete camelTrip.truck; }
    if (camelTrip.booking) { camelTrip.bookingId = toCamel(camelTrip.booking); delete camelTrip.booking; }

    res.json({ trip: camelTrip });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trip", error: error.message });
  }
}

export async function getTripByBooking(req, res) {
  try {
    const supabase = req.supabase || supabaseAdmin;
    const { data: trip, error } = await supabase.from("trips").select(`
      *,
      truck:truck_id (*),
      booking:booking_id (*)
    `).eq("booking_id", req.params.bookingId).single();

    if (error || !trip) return res.status(404).json({ message: "No active trip found for this booking." });

    const camelTrip = toCamel(trip);
    if (camelTrip.truck) { camelTrip.truckId = toCamel(camelTrip.truck); delete camelTrip.truck; }
    if (camelTrip.booking) { camelTrip.bookingId = toCamel(camelTrip.booking); delete camelTrip.booking; }

    res.json({ trip: camelTrip });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trip", error: error.message });
  }
}

export async function getMyTrips(req, res) {
  try {
    const userRole = req.user?.user_metadata?.role;
    const supabase = userRole === "DRIVER" ? supabaseAdmin : (req.supabase || supabaseAdmin);
    const userPhone = req.user?.user_metadata?.phone;
    const userId = req.user?.sub || req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Fetch trips where either the driver_phone matches the user's phone, 
    // OR the truck belongs to the user (transporter owner-operator).
    // First, find all trucks owned by this user
    const { data: trucks } = await supabase.from("trucks").select("id").eq("transporter_id", userId);
    const truckIds = trucks ? trucks.map(t => t.id) : [];

    let query = supabase.from("trips").select(`
      *,
      truck:truck_id (*),
      booking:booking_id (
        id, final_fare, status, 
        load:load_id ( origin_city, destination_city )
      )
    `);

    if (truckIds.length > 0 && userPhone) {
      query = query.or(`driver_phone.eq.${userPhone},truck_id.in.(${truckIds.join(',')})`);
    } else if (truckIds.length > 0) {
      query = query.in("truck_id", truckIds);
    } else if (userPhone) {
      query = query.eq("driver_phone", userPhone);
    } else {
      return res.json([]); // No trips can possibly match
    }

    const { data: trips, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Convert keys to camelCase for the frontend and format nested fields
    const formattedTrips = trips.map(trip => {
      const camelTrip = toCamel(trip);
      if (camelTrip.truck) { camelTrip.truckId = toCamel(camelTrip.truck); delete camelTrip.truck; }
      if (camelTrip.booking) { 
        camelTrip.bookingId = toCamel(camelTrip.booking); 
        // Emulate expected nested structure for DriverTripsPage
        camelTrip.Booking = {
          Load: {
            pickupAddress: camelTrip.booking.load?.origin_city || camelTrip.originCity,
            dropAddress: camelTrip.booking.load?.destination_city || camelTrip.destinationCity
          }
        };
        delete camelTrip.booking; 
      }
      return camelTrip;
    });

    res.json(formattedTrips);
  } catch (error) {
    console.error("getMyTrips error:", error);
    res.status(500).json({ message: "Failed to fetch trips", error: error.message });
  }
}

// Live simulation step: move truck forward towards destination
export async function simulateTripStep(req, res) {
  try {
    const userRole = req.user?.user_metadata?.role;
    const supabase = userRole === "DRIVER" ? supabaseAdmin : (req.supabase || supabaseAdmin);
    
    const { data: trip, error: fetchErr } = await supabase.from("trips").select("*").eq("id", req.params.id).single();
    if (fetchErr || !trip) return res.status(404).json({ message: "Trip not found." });

    if (trip.status === "DELIVERED" || trip.progress_percent >= 100) {
      return res.json({
        message: "Shipment has already arrived and been delivered!",
        trip: toCamel(trip),
      });
    }

    // Advance progress by 15-20%
    const nextProgress = Math.min(100, Number(trip.progress_percent) + 20);
    const fraction = nextProgress / 100;

    const oLat = trip.origin_coordinates?.lat ?? 19.076;
    const oLng = trip.origin_coordinates?.lng ?? 72.8777;
    const dLat = trip.destination_coordinates?.lat ?? 28.6139;
    const dLng = trip.destination_coordinates?.lng ?? 77.209;

    // Linear interpolation with slight highway road curve simulation
    const curveNoise = Math.sin(fraction * Math.PI) * 0.35;
    const nextLat = Number((oLat + (dLat - oLat) * fraction).toFixed(4));
    const nextLng = Number((oLng + (dLng - oLng) * fraction + curveNoise).toFixed(4));

    const updateData = {
      progress_percent: nextProgress,
      current_coordinates: { lat: nextLat, lng: nextLng }
    };

    let routeHistory = Array.isArray(trip.route_history) ? [...trip.route_history] : [];

    if (nextProgress >= 100) {
      updateData.status = "DELIVERED";
      updateData.speed_km_h = 0;
      updateData.estimated_arrival = "Delivered Just Now";
      routeHistory.push({
        lat: nextLat,
        lng: nextLng,
        timestamp: new Date().toISOString(),
        statusNote: `Delivered safely at ${trip.destination_city} Destination Hub`,
      });

      // Update associated booking and free up truck
      await supabaseAdmin.from("bookings").update({
        status: "DELIVERED",
        delivered_at: new Date()
      }).eq("id", trip.booking_id);
      
      if (trip.truck_id) {
        await supabaseAdmin.from("trucks").update({ status: "Available" }).eq("id", trip.truck_id);
      }
    } else {
      updateData.status = "IN_TRANSIT";
      updateData.speed_km_h = Math.floor(50 + Math.random() * 25);
      const hoursRemaining = Math.max(1, Math.round((1 - fraction) * 16));
      updateData.estimated_arrival = `ETA ~${hoursRemaining} hrs`;
      routeHistory.push({
        lat: nextLat,
        lng: nextLng,
        timestamp: new Date().toISOString(),
        statusNote: `Passed Waypoint at ${Math.round(nextProgress)}% distance (${updateData.speed_km_h} km/h)`,
      });
    }

    updateData.route_history = routeHistory;

    const { data: updatedTrip, error: updateErr } = await supabase.from("trips").update(updateData).eq("id", trip.id).select().single();
    if (updateErr) throw updateErr;

    res.json({
      message:
        nextProgress >= 100
          ? "🎉 Truck reached destination! Trip completed."
          : `Truck moved forward to ${Math.round(nextProgress)}% of journey!`,
      trip: toCamel(updatedTrip),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to simulate trip movement", error: error.message });
  }
}
