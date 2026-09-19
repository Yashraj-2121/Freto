import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);
      const { data } = await api.get("/bookings");
      setBookings(data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openInvoiceModal(booking) {
    setSelectedInvoice(booking);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-2">
            📄 Agreements & Tax Invoices
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Bookings & Freight Invoices
          </h1>
          <p className="text-sm text-slate-400">
            View all confirmed cargo shipments, printable GST invoices, and jump directly to live tracking.
          </p>
        </div>

        <Link to="/tracking" className="btn-primary text-xs">
          🗺️ Open Live GPS Tracking Map
        </Link>
      </div>

      {/* Bookings Table */}
      <div className="card overflow-hidden border-slate-800 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] border-b border-slate-800 tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Booking ID & Invoice</th>
                <th className="py-3.5 px-4 font-semibold">Route</th>
                <th className="py-3.5 px-4 font-semibold">Assigned Truck</th>
                <th className="py-3.5 px-4 font-semibold">Shipper & Transporter</th>
                <th className="py-3.5 px-4 font-semibold">Total Fare</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    Loading bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No confirmed bookings yet. Accept a bid in "My Loads" to generate your first booking and invoice!
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-white">{b.bookingReference}</div>
                      <div className="text-[11px] text-orange-400 font-mono">{b.invoiceNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">
                        {b.loadId?.originCity} → {b.loadId?.destinationCity}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {b.loadId?.cargoType} ({b.loadId?.weightTons}T)
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-white font-semibold">
                        {b.truckId?.truckNumber || "Assigned Fleet"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Driver: {b.truckId?.driverName || "Driver"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">{b.shipperId?.companyName || b.shipperId?.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Transporter: {b.transporterId?.companyName || b.transporterId?.name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-black text-orange-400 font-mono text-sm">
                        ₹{(b.totalAmount || b.finalFare).toLocaleString()}
                      </div>
                      <span className="badge bg-emerald-500/20 text-emerald-400 text-[10px]">
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`badge ${
                          b.status === "DELIVERED"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openInvoiceModal(b)}
                        className="btn-secondary text-[11px] py-1 px-2.5"
                      >
                        📄 Tax Invoice
                      </button>
                      <Link
                        to="/tracking"
                        className="btn-primary text-[11px] py-1 px-2.5 inline-block"
                      >
                        🗺️ Live Track
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-2xl w-full bg-slate-900 border-slate-700 p-8 space-y-6 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="badge bg-orange-500 text-white font-bold text-xs uppercase mb-1">
                  Tax Invoice (SAC: 996511)
                </span>
                <h3 className="text-xl font-black text-white">{selectedInvoice.invoiceNumber}</h3>
                <p className="text-xs text-slate-400">
                  Booking Reference: {selectedInvoice.bookingReference}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Bill To / Consignor & Consignee */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-850">
              <div className="space-y-1">
                <span className="text-orange-400 font-semibold uppercase text-[10px] block">
                  Shipper / Consignor (Billed To):
                </span>
                <div className="text-white font-bold text-sm">
                  {selectedInvoice.shipperId?.companyName || selectedInvoice.shipperId?.name}
                </div>
                <div className="text-slate-400">Email: {selectedInvoice.shipperId?.email}</div>
                <div className="text-slate-400">Phone: {selectedInvoice.shipperId?.phone}</div>
                <div className="text-slate-400">City: {selectedInvoice.loadId?.originCity}</div>
              </div>

              <div className="space-y-1">
                <span className="text-orange-400 font-semibold uppercase text-[10px] block">
                  Transporter / Fleet Contractor:
                </span>
                <div className="text-white font-bold text-sm">
                  {selectedInvoice.transporterId?.companyName || selectedInvoice.transporterId?.name}
                </div>
                <div className="text-slate-400">Vehicle: {selectedInvoice.truckId?.truckNumber}</div>
                <div className="text-slate-400">Driver: {selectedInvoice.truckId?.driverName}</div>
                <div className="text-slate-400">Phone: {selectedInvoice.truckId?.driverPhone}</div>
              </div>
            </div>

            {/* Consignment particulars */}
            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3 font-semibold">Description</th>
                    <th className="p-3 font-semibold">Route Details</th>
                    <th className="p-3 font-semibold text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  <tr>
                    <td className="p-3">
                      <div className="font-semibold text-white">
                        {selectedInvoice.loadId?.cargoType || "Freight Consignment"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Weight: {selectedInvoice.loadId?.weightTons} Tons • Truck:{" "}
                        {selectedInvoice.truckId?.truckType}
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        {selectedInvoice.loadId?.originCity} to {selectedInvoice.loadId?.destinationCity}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Dist: ~{selectedInvoice.loadId?.distanceKm} km
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-white">
                      ₹{selectedInvoice.finalFare.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total calculation */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-850 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal Freight Charge:</span>
                <span className="font-mono">₹{selectedInvoice.finalFare.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Goods & Services Tax (GST 5% RCM/Forward):</span>
                <span className="font-mono">
                  ₹{(selectedInvoice.gstAmount || Math.round(selectedInvoice.finalFare * 0.05)).toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                <span>Grand Total (Net Payable):</span>
                <span className="text-orange-400 font-mono text-lg">
                  ₹{(selectedInvoice.totalAmount || selectedInvoice.finalFare * 1.05).toLocaleString()}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                Payment Status:{" "}
                <span className="text-emerald-400 font-semibold">{selectedInvoice.paymentStatus}</span>{" "}
                via {selectedInvoice.paymentMethod}
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setSelectedInvoice(null)} className="btn-secondary text-xs">
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary text-xs px-5 flex items-center gap-1.5"
              >
                🖨️ Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
