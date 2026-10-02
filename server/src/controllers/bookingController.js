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

export async function getBookings(req, res) {
  try {
    const { shipperId, transporterId, status } = req.query;
    const supabase = req.supabase || supabaseAdmin;

    let query = supabase.from("bookings").select(`
      *,
      load:load_id (*),
      truck:truck_id (*)
    `).order('created_at', { ascending: false });

    if (shipperId) query = query.eq("shipper_id", shipperId);
    if (transporterId) query = query.eq("transporter_id", transporterId);
    if (status) query = query.eq("status", status);

    const { data: bookings, error } = await query;
    if (error) throw error;

    const formattedBookings = bookings.map(b => {
      const camelBooking = toCamel(b);
      if (camelBooking.load) { camelBooking.loadId = toCamel(camelBooking.load); delete camelBooking.load; }
      if (camelBooking.truck) { camelBooking.truckId = toCamel(camelBooking.truck); delete camelBooking.truck; }
      return camelBooking;
    });

    res.json({ count: formattedBookings.length, bookings: formattedBookings });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
}

export async function getBookingById(req, res) {
  try {
    const supabase = req.supabase || supabaseAdmin;
    const { data: booking, error } = await supabase.from("bookings").select(`
      *,
      load:load_id (*),
      truck:truck_id (*)
    `).eq("id", req.params.id).single();

    if (error || !booking) return res.status(404).json({ message: "Booking not found" });

    // Look for associated trip
    const { data: trip } = await supabase.from("trips").select("*").eq("booking_id", booking.id).single();

    const camelBooking = toCamel(booking);
    if (camelBooking.load) { camelBooking.loadId = toCamel(camelBooking.load); delete camelBooking.load; }
    if (camelBooking.truck) { camelBooking.truckId = toCamel(camelBooking.truck); delete camelBooking.truck; }

    res.json({ booking: camelBooking, trip: toCamel(trip) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch booking details", error: error.message });
  }
}

export async function updateBookingStatus(req, res) {
  try {
    const { status, paymentStatus } = req.body;
    const supabase = req.supabase || supabaseAdmin;

    const { data: booking, error: fetchErr } = await supabase.from("bookings").select("*").eq("id", req.params.id).single();
    if (fetchErr || !booking) return res.status(404).json({ message: "Booking not found" });

    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.payment_status = paymentStatus;

    if (status === "DELIVERED") {
      updateData.delivered_at = new Date();
      // Free up the truck
      if (booking.truck_id) {
        await supabaseAdmin.from("trucks").update({ status: "Available" }).eq("id", booking.truck_id);
      }
      // Update trip
      await supabaseAdmin.from("trips").update({ 
        status: "DELIVERED", 
        progress_percent: 100, 
        speed_km_h: 0 
      }).eq("booking_id", booking.id);
    }

    const { data: updatedBooking, error: updateErr } = await supabase.from("bookings")
      .update(updateData).eq("id", req.params.id).select().single();
      
    if (updateErr) throw updateErr;

    res.json({ message: "Booking updated successfully", booking: toCamel(updatedBooking) });
  } catch (error) {
    res.status(500).json({ message: "Failed to update booking", error: error.message });
  }
}
