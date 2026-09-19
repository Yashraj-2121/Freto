import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";

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

const TRUCK_TYPES = [
  "Mini Truck / Tata Ace (1-2 Ton)",
  "14ft Open Body (3-4 Ton)",
  "19ft Container (7-8 Ton)",
  "24ft Multi-Axle (10-12 Ton)",
  "32ft Multi-Axle (15-20 Ton)",
  "Refrigerated Container (5-10 Ton)",
  "Flatbed Trailer (25+ Ton)",
];

export default function FreightCalculator() {
  const [originCity, setOriginCity] = useState("Mumbai");
  const [destinationCity, setDestinationCity] = useState("Delhi");
  const [truckType, setTruckType] = useState("14ft Open Body (3-4 Ton)");
  const [weightTons, setWeightTons] = useState(3.5);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(null);

  async function handleCalculate(e) {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/calculator", {
        originCity,
        destinationCity,
        truckType,
        weightTons: Number(weightTons),
      });
      setQuote(data);
    } catch (err) {
      console.error("Calculation error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card border-orange-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-semibold mb-2">
              ⚡ Instant Estimate Tool
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Freight & Truck Rate Calculator
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Compute transparent point-to-point road freight rates, toll estimates, and fuel cost
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Live Pricing Engine v2.4</span>
        </div>

        <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pickup City */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              📍 Origin / Pickup City
            </label>
            <select
              value={originCity}
              onChange={(e) => setOriginCity(e.target.value)}
              className="input bg-slate-950"
            >
              {POPULAR_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Delivery City */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              🎯 Destination City
            </label>
            <select
              value={destinationCity}
              onChange={(e) => setDestinationCity(e.target.value)}
              className="input bg-slate-950"
            >
              {POPULAR_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Truck Type */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              🚛 Recommended Truck
            </label>
            <select
              value={truckType}
              onChange={(e) => setTruckType(e.target.value)}
              className="input bg-slate-950"
            >
              {TRUCK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              ⚖️ Cargo Weight (Tons)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="40"
                value={weightTons}
                onChange={(e) => setWeightTons(e.target.value)}
                className="input bg-slate-950"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary whitespace-nowrap px-4 py-2 text-xs"
              >
                {loading ? "..." : "Calculate"}
              </button>
            </div>
          </div>
        </form>

        {/* Calculated Result Card */}
        {quote && (
          <div className="mt-6 pt-6 border-t border-slate-800 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="space-y-2">
                <div className="text-xs text-slate-400 font-medium">Route Distance & Transit</div>
                <div className="text-2xl font-black text-white flex items-center gap-2">
                  <span>{quote.distanceKm} km</span>
                  <span className="text-sm font-normal text-slate-400">
                    (~{quote.estimatedTransitHours} hrs road transit)
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  From <span className="text-white font-medium">{quote.originCity}</span> to{" "}
                  <span className="text-white font-medium">{quote.destinationCity}</span>
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Base Loading & Dispatch:</span>
                  <span className="font-mono">₹{quote.breakdown.baseFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Distance Fare ({quote.distanceKm} km):</span>
                  <span className="font-mono">₹{quote.breakdown.distanceFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>↳ Incl. Est. Fuel & Tolls:</span>
                  <span className="font-mono">
                    ₹{(quote.breakdown.estimatedFuelCost + quote.breakdown.estimatedTolls).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>↳ Freight GST (5%):</span>
                  <span className="font-mono">₹{quote.breakdown.gstAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Total Estimated Fare & Action */}
              <div className="text-right space-y-2">
                <div className="text-xs text-slate-400">Total All-Inclusive Estimate</div>
                <div className="text-3xl font-black text-orange-400 tracking-tight">
                  ₹{quote.totalEstimatedFare.toLocaleString()}
                </div>
                <div>
                  <Link
                    to={`/loads/new?origin=${quote.originCity}&dest=${quote.destinationCity}&type=${encodeURIComponent(
                      quote.truckType
                    )}&weight=${quote.weightTons}&budget=${quote.totalEstimatedFare}`}
                    className="btn-primary w-full sm:w-auto text-xs py-2 px-4 inline-block text-center"
                  >
                    Post This Load & Book Truck →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
