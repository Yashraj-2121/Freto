import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function MyLoadsPage() {
  const { user, quickDemoLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(
    searchParams.get("posted") ? "🎉 Your freight load was posted successfully! Transporters will place quotes shortly." : null
  );

  useEffect(() => {
    fetchLoads();
  }, []);

  async function fetchLoads() {
    try {
      setLoading(true);
      const { data } = await api.get("/loads");
      setLoads(data.loads);
      if (data.loads.length > 0) {
        loadBids(data.loads[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadBids(load) {
    setSelectedLoad(load);
    try {
      setBidsLoading(true);
      const { data } = await api.get(`/loads/${load._id}`);
      setBids(data.bids || []);
    } catch (err) {
      console.error(err);
    } finally {
      setBidsLoading(false);
    }
  }

  async function handleAcceptBid(bidId) {
    if (!confirm("Are you sure you want to accept this quote and confirm the booking?")) return;
    try {
      setActionMessage("Confirming booking & generating invoice...");
      const { data } = await api.post(`/bids/${bidId}/accept`);
      setActionMessage(`✅ ${data.message}`);
      fetchLoads();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept bid.");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-2">
            📦 Shipper Operations
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            My Freight Loads & Transporter Bids
          </h1>
          <p className="text-sm text-slate-400">
            Review incoming quotations from fleet owners, accept the best deal, and generate tax invoices.
          </p>
        </div>

        <Link to="/loads/new" className="btn-primary text-xs">
          + Post Another Load
        </Link>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 text-sm">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading your freight loads...</div>
      ) : loads.length === 0 ? (
        <div className="card text-center py-16 space-y-4">
          <div className="text-4xl">📦</div>
          <h3 className="text-lg font-bold text-white">No loads posted yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't posted any freight loads. Post your first load now and watch fleet owners place bids!
          </p>
          <Link to="/loads/new" className="btn-primary text-xs inline-block">
            Post Freight Load Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Col: Loads List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              All Posted Loads ({loads.length})
            </h3>
            <div className="space-y-3">
              {loads.map((load) => (
                <div
                  key={load._id}
                  onClick={() => loadBids(load)}
                  className={`card p-4 cursor-pointer transition-all duration-200 ${
                    selectedLoad?._id === load._id
                      ? "border-orange-500 bg-slate-850 shadow-orange-500/10"
                      : "hover:border-slate-700 bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`badge text-[10px] ${
                        load.status === "BOOKED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : load.status === "BIDDING"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {load.status}
                    </span>
                    <span className="text-xs font-bold text-orange-400 font-mono">
                      ₹{load.budget.toLocaleString()}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-2 line-clamp-1">{load.title}</h4>
                  <div className="text-xs text-slate-400 mt-1">
                    {load.originCity} → {load.destinationCity} ({load.weightTons}T)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    Pickup: {new Date(load.pickupDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Selected Load Details & Received Bids */}
          <div className="lg:col-span-2 space-y-6">
            {selectedLoad ? (
              <div className="card p-6 border-slate-800 space-y-6">
                {/* Header */}
                <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="badge bg-orange-500/15 text-orange-400 border border-orange-500/30 text-xs mb-1">
                      {selectedLoad.cargoType}
                    </span>
                    <h2 className="text-xl font-bold text-white">{selectedLoad.title}</h2>
                    <p className="text-xs text-slate-400">
                      Route: <span className="text-white">{selectedLoad.originCity}</span> to{" "}
                      <span className="text-white">{selectedLoad.destinationCity}</span> (~
                      {selectedLoad.distanceKm} km)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Target Budget</span>
                    <span className="text-2xl font-black text-orange-400">
                      ₹{selectedLoad.budget.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Received Bids Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Transporter Quotations & Bids</span>
                      <span className="badge bg-slate-800 text-slate-300">{bids.length}</span>
                    </h3>
                    <span className="text-xs text-slate-400">Sorted by best offer</span>
                  </div>

                  {bidsLoading ? (
                    <div className="text-center py-8 text-slate-400">Loading bids...</div>
                  ) : bids.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800 space-y-2">
                      <div className="text-2xl">⏳</div>
                      <p className="text-xs text-slate-300 font-medium">
                        No bids placed on this load yet.
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Tip for Teacher Demo: Click "🚚 Transporter" in the top demo bar, open "Freight Marketplace",
                        and submit a quote on this load!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bids.map((bid) => (
                        <div
                          key={bid._id}
                          className={`p-4 rounded-xl border transition-all ${
                            bid.status === "ACCEPTED"
                              ? "bg-emerald-950/30 border-emerald-500/50"
                              : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">
                                  {bid.transporterId?.companyName || bid.transporterId?.name || "Fleet Transporter"}
                                </span>
                                <span
                                  className={`badge text-[10px] ${
                                    bid.status === "ACCEPTED"
                                      ? "bg-emerald-500 text-white font-bold"
                                      : "bg-slate-800 text-slate-400"
                                  }`}
                                >
                                  {bid.status}
                                </span>
                              </div>

                              <div className="text-xs text-slate-400">
                                Assigned Truck:{" "}
                                <span className="text-slate-200 font-mono font-medium">
                                  {bid.truckId?.truckNumber}
                                </span>{" "}
                                ({bid.truckId?.truckType}) • Driver:{" "}
                                <span className="text-slate-200">{bid.truckId?.driverName}</span>
                              </div>

                              {bid.message && (
                                <p className="text-xs text-slate-400 italic">"{bid.message}"</p>
                              )}
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                              <div>
                                <span className="text-[10px] text-slate-400 block text-right">Quoted Fare</span>
                                <span className="text-xl font-black text-orange-400">
                                  ₹{bid.bidAmount.toLocaleString()}
                                </span>
                              </div>

                              {bid.status === "ACCEPTED" ? (
                                <Link to="/bookings" className="btn-primary text-xs py-1.5 px-3">
                                  View Booking & Invoice →
                                </Link>
                              ) : selectedLoad.status !== "BOOKED" ? (
                                <button
                                  onClick={() => handleAcceptBid(bid._id)}
                                  className="btn-primary text-xs py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 border-none shadow-emerald-500/20"
                                >
                                  Accept & Confirm Booking
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center text-slate-400">
                Select a load from the left list to view details and transporter quotations.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
