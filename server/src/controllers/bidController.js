import { supabaseAdmin } from "../config/supabase.js";
// Models removed for Postgres migration
// import { Bid } from "../models/Bid.js";
// import { Load } from "../models/Load.js";
// import { Truck } from "../models/Truck.js";
// import { Booking } from "../models/Booking.js";
// import { Trip } from "../models/Trip.js";

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

export async function getBids(req, res) {
  try {
    const { loadId, transporterId } = req.query;
    const supabase = req.supabase || supabaseAdmin;

    let query = supabase
      .from("bids")
      .select(`
        *,
        load:load_id (*),
        truck:truck_id (*)
      `)
      .order('created_at', { ascending: false });

    if (loadId) query = query.eq('load_id', loadId);
    if (transporterId) query = query.eq('transporter_id', transporterId);

    const { data: bids, error } = await query;
    if (error) throw error;

    // Format for frontend
    const formattedBids = bids.map(bid => {
      const camelBid = toCamel(bid);
      if (camelBid.load) { camelBid.loadId = toCamel(camelBid.load); delete camelBid.load; }
      if (camelBid.truck) { camelBid.truckId = toCamel(camelBid.truck); delete camelBid.truck; }
      return camelBid;
    });

    res.json({ count: formattedBids.length, bids: formattedBids });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bids", error: error.message });
  }
}

export async function placeBid(req, res) {
  try {
    const { loadId, truckId, bidAmount, message, estimatedDeliveryHours } = req.body;

    if (!loadId || !truckId || !bidAmount) {
      return res.status(400).json({ message: "Load ID, Truck ID, and Bid Amount are required." });
    }

    const supabase = req.supabase || supabaseAdmin;

    // Check load
    const { data: load, error: loadErr } = await supabase.from("loads").select("*").eq("id", loadId).single();
    if (loadErr || !load) return res.status(404).json({ message: "Load not found." });
    
    if (load.status !== "POSTED" && load.status !== "BIDDING") {
      return res.status(400).json({ message: "This load is no longer accepting bids." });
    }

    // Check truck
    const { data: truck, error: truckErr } = await supabase.from("trucks").select("*").eq("id", truckId).single();
    if (truckErr || !truck) return res.status(404).json({ message: "Truck not found." });

    let transporterId = req.user ? (req.user.sub || req.user.id) : req.body.transporterId;
    if (!transporterId) transporterId = truck.transporter_id;

    if (!transporterId) {
      return res.status(401).json({ message: "Unauthorized. Transporter ID required." });
    }

    // Upsert bid
    const { data: bid, error: bidErr } = await supabase.from("bids").upsert({
      load_id: loadId,
      transporter_id: transporterId,
      truck_id: truckId,
      bid_amount: Number(bidAmount),
      message: message || "Available immediately with verified GPS-enabled truck.",
      estimated_delivery_hours: estimatedDeliveryHours || 24,
    }, { onConflict: 'load_id, transporter_id' }).select().single();

    if (bidErr) throw bidErr;

    // Update load status to BIDDING
    await supabase.from("loads").update({ status: "BIDDING" }).eq("id", loadId);

    res.status(201).json({ message: "Bid placed successfully", bid: toCamel(bid) });
  } catch (error) {
    console.error("placeBid error:", error);
    res.status(500).json({ message: `Failed to place bid: ${error.message}`, error: error.message });
  }
}

export async function acceptBid(req, res) {
  // Migration Note: Booking & Trip creation has been temporarily suspended
  // while we migrate those modules to Supabase. 
  // Currently, this will only accept the bid and mark the load as BOOKED.
  try {
    const { bidId } = req.params;
    const supabase = req.supabase || supabaseAdmin;

    // Fetch Bid
    const { data: bid, error: bidErr } = await supabase.from("bids").select("*").eq("id", bidId).single();
    if (bidErr || !bid) return res.status(404).json({ message: "Bid not found" });

    // Fetch Load
    const { data: load, error: loadErr } = await supabase.from("loads").select("*").eq("id", bid.load_id).single();
    if (loadErr || !load || load.status === "BOOKED" || load.status === "DELIVERED") {
      return res.status(400).json({ message: "Load is already booked or completed." });
    }

    // 1. Mark this bid as ACCEPTED
    await supabase.from("bids").update({ status: "ACCEPTED" }).eq("id", bidId);
    
    // 2. Mark all other bids for this load as REJECTED
    await supabase.from("bids").update({ status: "REJECTED" }).eq("load_id", load.id).neq("id", bidId);

    // 3. Mark load as BOOKED
    await supabase.from("loads").update({ status: "BOOKED" }).eq("id", load.id);

    // 4. Mark truck as On Trip
    const { data: truck } = await supabase.from("trucks").update({ status: "On Trip" }).eq("id", bid.truck_id).select().single();

    // 5. Generate clean invoice number & booking reference
    const timestamp = Date.now().toString().slice(-6);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${timestamp}`;
    const bookingReference = `BK-${(load.origin_city || 'XXX').slice(0, 3).toUpperCase()}-${timestamp}`;

    // 6. Create Booking
    const { data: booking, error: bookingErr } = await supabase.from("bookings").insert({
      booking_reference: bookingReference,
      load_id: load.id,
      bid_id: bid.id,
      shipper_id: load.shipper_id,
      transporter_id: bid.transporter_id,
      truck_id: bid.truck_id,
      final_fare: bid.bid_amount,
      gst_amount: Math.round(bid.bid_amount * 0.05),
      total_amount: bid.bid_amount + Math.round(bid.bid_amount * 0.05),
      status: "CONFIRMED",
      payment_status: "PAID",
      payment_method: "Online Card/UPI (Prepaid)",
      invoice_number: invoiceNumber
    }).select().single();

    if (bookingErr) throw bookingErr;

    // Coordinates dictionary for Indian logistics hubs
    const CITY_COORDINATES = {
      Mumbai: { lat: 19.076, lng: 72.8777 },
      Delhi: { lat: 28.6139, lng: 77.209 },
      Bengaluru: { lat: 12.9716, lng: 77.5946 },
      Chennai: { lat: 13.0827, lng: 80.2707 },
      Kolkata: { lat: 22.5726, lng: 88.3639 },
      Ahmedabad: { lat: 23.0225, lng: 72.5714 },
      Hyderabad: { lat: 17.385, lng: 78.4867 },
      Pune: { lat: 18.5204, lng: 73.8567 },
      Surat: { lat: 21.1702, lng: 72.8311 },
      Jaipur: { lat: 26.9124, lng: 75.7873 },
      Nagpur: { lat: 21.1458, lng: 79.0882 },
      Indore: { lat: 22.7196, lng: 75.8577 },
    };

    // 7. Automatically spin up a Live Trip for tracking!
    const originCoords = CITY_COORDINATES[load.origin_city] || { lat: 19.076, lng: 72.8777 };
    const destCoords = CITY_COORDINATES[load.destination_city] || { lat: 28.6139, lng: 77.209 };

    const { data: trip, error: tripErr } = await supabase.from("trips").insert({
      booking_id: booking.id,
      truck_id: bid.truck_id,
      driver_name: truck?.driver_name || "Assigned Driver",
      driver_phone: truck?.driver_phone || "+91 98765 43210",
      origin_city: load.origin_city,
      destination_city: load.destination_city,
      origin_coordinates: originCoords,
      destination_coordinates: destCoords,
      current_coordinates: {
        lat: originCoords.lat,
        lng: originCoords.lng,
      },
      progress_percent: 0,
      speed_km_h: 0,
      status: "CONFIRMED",
      estimated_arrival: "Awaiting Dispatch",
      route_history: [
        {
          lat: originCoords.lat,
          lng: originCoords.lng,
          timestamp: new Date().toISOString(),
          statusNote: `Booking Confirmed. Awaiting driver dispatch for ${load.origin_city} pickup.`,
        },
      ],
    }).select().single();

    if (tripErr) throw tripErr;

    res.json({
      message: "Bid accepted successfully! Booking confirmed and Trip dispatched.",
      booking: toCamel(booking),
      trip: toCamel(trip)
    });
  } catch (error) {
    console.error("acceptBid error:", error);
    res.status(500).json({ message: "Failed to accept bid", error: error.message });
  }
}
