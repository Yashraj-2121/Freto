import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function BrowseLoadsPage() {
  const { user, quickDemoLogin } = useAuth();
  const [loads, setLoads] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [originFilter, setOriginFilter] = useState("");
  const [destFilter, setDestFilter] = useState("");

  // Bidding modal state
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [selectedTruckId, setSelectedTruckId] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [biddingLoading, setBiddingLoading] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(null);

  useEffect(() => {
    fetchLoads();
    fetchTrucks();
  }, [originFilter, destFilter]);

  async function fetchLoads() {
    try {
      setLoading(true);
      let query = "/loads?status=POSTED";
      if (originFilter) query += `&origin=${encodeURIComponent(originFilter)}`;
      if (destFilter) query += `&destination=${encodeURIComponent(destFilter)}`;

      const { data } = await api.get(query);
      setLoads(data.loads);
    } catch (err) {
      console.error("Error fetching loads:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTrucks() {
    try {
      const { data } = await api.get("/trucks?status=Available");
      setTrucks(data.trucks);
      if (data.trucks.length > 0) {
        setSelectedTruckId(data.trucks[0]._id);
      }
    } catch (err) {
      console.error("Error fetching trucks:", err);
    }
  }

  function openBidModal(load) {
    setSelectedLoad(load);
    setBidAmount(load.budget);
    setBidMessage(`Truck available immediately for pickup on ${new Date(load.pickupDate).toLocaleDateString()}. Experienced highway driver.`);
    setBidSuccess(null);
  }

  async function handlePlaceBid(e) {
    e.preventDefault();
    setBiddingLoading(true);
    setBidSuccess(null);

    try {
      if (!user) {
        await quickDemoLogin("TRANSPORTER");
      }

      const transporterId = user?.id || user?._id;

      await api.post("/bids", {
        loadId: selectedLoad._id,
        truckId: selectedTruckId,
        bidAmount: Number(bidAmount),
        message: bidMessage,
        transporterId,
      });

      setBidSuccess("Bid submitted successfully! The shipper has been notified.");
      setTimeout(() => {
        setSelectedLoad(null);
        fetchLoads();
      }, 1500);
    } catch (err) {
      console.error("Bid error:", err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || "Failed to submit bid.";
      alert(errMsg);
    } finally {
      setBiddingLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-2">
            🚚 Transporter Exchange
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Freight Loads Marketplace
          </h1>
          <p className="text-sm text-slate-400">
            Browse verified cargo shipments requiring trucks. Submit competitive quotes and secure trips.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/fleet" className="btn-secondary text-xs">
            Manage My Fleet ({trucks.length} available)
          </Link>
          <Link to="/loads/new" className="btn-primary text-xs">
            Post a Load
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 flex flex-wrap items-center gap-4 bg-slate-900/90 border-slate-800">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="text-xs text-slate-400">Origin:</span>
          <input
            type="text"
            placeholder="Search City (e.g. Mumbai)"
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="input py-1.5 text-xs"
          />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="text-xs text-slate-400">Destination:</span>
          <input
            type="text"
            placeholder="Search City (e.g. Delhi)"
            value={destFilter}
            onChange={(e) => setDestFilter(e.target.value)}
            className="input py-1.5 text-xs"
          />
        </div>
        {(originFilter || destFilter) && (
          <button
            onClick={() => {
              setOriginFilter("");
              setDestFilter("");
            }}
            className="text-xs text-orange-400 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Load Cards Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading freight marketplace...</div>
      ) : loads.length === 0 ? (
        <div className="card text-center py-16 space-y-4">
          <div className="text-4xl">📦</div>
          <h3 className="text-lg font-bold text-white">No active loads matching filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or post a test freight load to see it appear here immediately!
          </p>
          <Link to="/loads/new" className="btn-primary text-xs inline-block">
            Post a Freight Load
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loads.map((load) => (
            <div
              key={load._id}
              className="card flex flex-col justify-between hover:border-orange-500/40 transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Route Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="badge bg-orange-500/15 text-orange-400 border border-orange-500/30 text-[11px] mb-1">
                      {load.cargoType}
                    </span>
                    <h3 className="text-base font-bold text-white line-clamp-1">{load.title}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Target Budget</span>
                    <span className="text-lg font-black text-orange-400">
                      ₹{load.budget.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Route Visual */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-slate-400">From:</span>
                    <span className="text-white font-medium">{load.originCity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                    <span className="text-slate-400">To:</span>
                    <span className="text-white font-medium">{load.destinationCity}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      (~{load.distanceKm} km)
                    </span>
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-850 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Payload Weight</span>
                    <span className="text-slate-200 font-medium">{load.weightTons} Tons</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Truck Required</span>
                    <span className="text-slate-200 font-medium truncate block">
                      {load.truckTypeNeeded}
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-850">
                    <span className="text-slate-400 text-[11px]">Pickup Date: </span>
                    <span className="text-slate-200">
                      {new Date(load.pickupDate).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {load.notes && (
                  <p className="text-xs text-slate-400 italic line-clamp-2">"{load.notes}"</p>
                )}
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Shipper: {load.shipperId?.companyName || load.shipperId?.name || "Verified Shipper"}
                </span>
                <button onClick={() => openBidModal(load)} className="btn-primary text-xs py-2 px-4">
                  Quote / Bid Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bidding Modal */}
      {selectedLoad && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-lg w-full bg-slate-900 border-slate-700 p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Place Quotation / Bid</h3>
                <p className="text-xs text-slate-400">
                  {selectedLoad.originCity} → {selectedLoad.destinationCity} ({selectedLoad.weightTons}T)
                </p>
              </div>
              <button
                onClick={() => setSelectedLoad(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {bidSuccess ? (
              <div className="p-5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm text-center space-y-3">
                <div className="text-xl">✅</div>
                <div className="font-semibold">{bidSuccess}</div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLoad(null);
                    fetchLoads();
                  }}
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handlePlaceBid} className="space-y-4">
                {/* Truck Selection */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Select Your Truck to Assign
                  </label>
                  {trucks.length === 0 ? (
                    <div className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                      No available trucks found.{" "}
                      <Link to="/fleet" className="underline font-bold">
                        Add a truck to your fleet first
                      </Link>
                      .
                    </div>
                  ) : (
                    <select
                      className="input"
                      value={selectedTruckId}
                      onChange={(e) => setSelectedTruckId(e.target.value)}
                      required
                    >
                      {trucks.map((truck) => (
                        <option key={truck._id} value={truck._id}>
                          {truck.truckNumber} — {truck.truckType} ({truck.capacityTons}T, Driver:{" "}
                          {truck.driverName})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Bid Amount */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your Quoted Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    className="input"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    required
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>Shipper's target budget: ₹{selectedLoad.budget.toLocaleString()}</span>
                    <span>All-inclusive road freight</span>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Message / Delivery Commitment
                  </label>
                  <textarea
                    className="input h-20 text-xs"
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    placeholder="e.g. Can pick up within 2 hours, GPS enabled vehicle, tarpaulin covered."
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedLoad(null)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={biddingLoading || trucks.length === 0}
                    className="btn-primary text-xs px-5"
                  >
                    {biddingLoading ? "Submitting..." : "Submit Quotation"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
