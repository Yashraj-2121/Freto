import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const CARGO_TYPES = [
  "FMCG & Consumer Goods",
  "Industrial Machinery & Parts",
  "Textiles & Garments",
  "Agriculture & Perishables",
  "Electronics & Appliances",
  "Construction & Steel Materials",
  "Chemicals & Pharma",
  "Other General Freight",
];

const TRUCK_TYPES = [
  "Mini Truck / Tata Ace (1-2 Ton)",
  "14ft Open Body (3-4 Ton)",
  "19ft Container (7-8 Ton)",
  "24ft Multi-Axle (10-12 Ton)",
  "32ft Multi-Axle (15-20 Ton)",
  "Refrigerated Container (5-10 Ton)",
  "Flatbed Trailer (25+ Ton)",
];

const POPULAR_CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Hyderabad",
  "Pune",
  "Jaipur",
  "Surat",
  "Nagpur",
  "Indore",
];

export default function BookTruckPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, quickDemoLogin } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    originCity: searchParams.get("origin") || "Mumbai",
    originAddress: "",
    destinationCity: searchParams.get("dest") || "Delhi",
    destinationAddress: "",
    cargoType: "FMCG & Consumer Goods",
    weightTons: searchParams.get("weight") || "3.5",
    truckTypeNeeded: searchParams.get("type") || "14ft Open Body (3-4 Ton)",
    budget: searchParams.get("budget") || "45000",
    pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-fill title if empty
  useEffect(() => {
    if (!formData.title) {
      setFormData((prev) => ({
        ...prev,
        title: `${prev.weightTons}T ${prev.cargoType} Consignment (${prev.originCity} → ${prev.destinationCity})`,
      }));
    }
  }, [formData.originCity, formData.destinationCity, formData.cargoType, formData.weightTons]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let currentUser = user;
      if (!currentUser) {
        currentUser = await quickDemoLogin("SHIPPER");
      }

      const shipperId = currentUser?.id || currentUser?._id;

      const { data } = await api.post("/loads", {
        ...formData,
        shipperId,
        weightTons: Number(formData.weightTons),
        budget: Number(formData.budget),
      });

      navigate("/loads/mine?posted=true");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to post freight load.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
          📦 Shipper Cargo Booking Portal
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Book a Truck & Post Freight Load
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Submit your cargo shipment requirements. Verified fleet owners will immediately place
          transparent competitive quotes.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Form Card */}
      <div className="card border-slate-800 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Load Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Consignment Title / Brief Description
            </label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 500 Cartons of FMCG Goods"
              required
            />
          </div>

          {/* Route Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Origin */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-850">
              <label className="block text-xs font-semibold text-orange-400 uppercase tracking-wider">
                📍 Origin / Pickup Details
              </label>
              <div>
                <span className="block text-xs text-slate-400 mb-1">Pickup City</span>
                <select
                  className="input"
                  value={formData.originCity}
                  onChange={(e) => setFormData({ ...formData, originCity: e.target.value })}
                >
                  {POPULAR_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="block text-xs text-slate-400 mb-1">Specific Pickup Address / Warehouse</span>
                <input
                  type="text"
                  className="input"
                  value={formData.originAddress}
                  onChange={(e) => setFormData({ ...formData, originAddress: e.target.value })}
                  placeholder="e.g. Bhiwandi Logistics Corridor, Hub 3"
                />
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-850">
              <label className="block text-xs font-semibold text-orange-400 uppercase tracking-wider">
                🎯 Destination / Drop Details
              </label>
              <div>
                <span className="block text-xs text-slate-400 mb-1">Delivery City</span>
                <select
                  className="input"
                  value={formData.destinationCity}
                  onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                >
                  {POPULAR_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="block text-xs text-slate-400 mb-1">Specific Delivery Address</span>
                <input
                  type="text"
                  className="input"
                  value={formData.destinationAddress}
                  onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                  placeholder="e.g. Okhla Industrial Area Phase-II"
                />
              </div>
            </div>
          </div>

          {/* Cargo Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                📦 Cargo Category
              </label>
              <select
                className="input"
                value={formData.cargoType}
                onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
              >
                {CARGO_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                ⚖️ Payload Weight (Tons)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                className="input"
                value={formData.weightTons}
                onChange={(e) => setFormData({ ...formData, weightTons: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                🚛 Truck Type Needed
              </label>
              <select
                className="input"
                value={formData.truckTypeNeeded}
                onChange={(e) => setFormData({ ...formData, truckTypeNeeded: e.target.value })}
              >
                {TRUCK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Commercials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                💰 Target Shipper Budget (₹ INR)
              </label>
              <input
                type="number"
                min="500"
                step="500"
                className="input"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">Transporters can quote below or above this target</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                📅 Preferred Pickup Date
              </label>
              <input
                type="date"
                className="input"
                value={formData.pickupDate}
                onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Handling Instructions */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              📝 Handling Instructions & Cargo Notes
            </label>
            <textarea
              className="input h-24"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Fragile cartons, keep dry, tarpaulin required, forklift loading assistance provided."
            />
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              ⚡ Instant dispatch to over 5,000+ verified fleet transporters
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto px-8 py-3 text-base">
              {loading ? "Publishing Load..." : "🚀 Post Freight Load Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
