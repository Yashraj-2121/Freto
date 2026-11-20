import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { solveRouteLocally } from "../utils/localOptimizer.js";

const DEFAULT_CITIES = [
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
  "Lucknow",
  "Chandigarh",
  "Bhopal",
  "Vadodara",
  "Coimbatore",
  "Kochi",
  "Visakhapatnam",
  "Patna",
  "Ludhiana",
  "Varanasi",
  "Guwahati",
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

export default function RouteOptimizerPage() {
  const [originCity, setOriginCity] = useState("Mumbai");
  const [destinationCity, setDestinationCity] = useState("Delhi");
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [stops, setStops] = useState([
    { id: 1, name: "Jaipur", demandWeightTons: 1.2, notes: "Automotive Hub" },
    { id: 2, name: "Pune", demandWeightTons: 0.8, notes: "Electronics Batch" },
    { id: 3, name: "Ahmedabad", demandWeightTons: 1.5, notes: "Textile Parcels" },
  ]);
  const [truckType, setTruckType] = useState("24ft Multi-Axle (10-12 Ton)");
  const [totalWeightTons, setTotalWeightTons] = useState(4.5);
  const [strategy, setStrategy] = useState("Balanced");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [engineStatus, setEngineStatus] = useState({ checking: true, online: false });

  // Check C# Engine Status on load
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await api.get("/optimizer/status");
        if (res.data?.online) {
          setEngineStatus({ checking: false, online: true, isLocalCs: true, details: res.data });
          return;
        }
      } catch (err) {}

      // Fallback check directly to localhost:5050 if running on localhost
      if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        try {
          const direct = await fetch("http://localhost:5050/api/optimizer/health");
          if (direct.ok) {
            setEngineStatus({ checking: false, online: true, isLocalCs: true, direct: true });
            return;
          }
        } catch (_) {}
      }

      // Cloud deployment (Netlify) or local C# offline: use hybrid solver
      setEngineStatus({ checking: false, online: true, isLocalCs: false, isCloudSolver: true });
    }
    checkStatus();
  }, []);

  function handleAddStop() {
    const available = DEFAULT_CITIES.find(
      (c) => c !== originCity && !stops.some((s) => s.name === c)
    ) || "Indore";

    setStops([
      ...stops,
      {
        id: Date.now(),
        name: available,
        demandWeightTons: 1.0,
        notes: `Waypoint #${stops.length + 1}`,
      },
    ]);
  }

  function handleRemoveStop(id) {
    if (stops.length <= 1) return;
    setStops(stops.filter((s) => s.id !== id));
  }

  function handleStopChange(id, field, value) {
    setStops(
      stops.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  function loadDemoPreset() {
    setOriginCity("Mumbai");
    setDestinationCity("Delhi");
    setIsRoundTrip(false);
    setStops([
      { id: 101, name: "Jaipur", demandWeightTons: 1.2, notes: "North Distribution Center" },
      { id: 102, name: "Pune", demandWeightTons: 0.8, notes: "Auto Component Depot" },
      { id: 103, name: "Ahmedabad", demandWeightTons: 1.5, notes: "Chemical Delivery" },
      { id: 104, name: "Indore", demandWeightTons: 1.0, notes: "Central Warehouse Hub" },
    ]);
    setTruckType("24ft Multi-Axle (10-12 Ton)");
    setTotalWeightTons(4.5);
    setStrategy("Balanced");
  }

  async function handleOptimize(e) {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      origin: { name: originCity },
      stops: stops.map((s) => ({
        name: s.name,
        demandWeightTons: Number(s.demandWeightTons) || 0,
        notes: s.notes,
      })),
      destination: isRoundTrip ? null : { name: destinationCity },
      isRoundTrip,
      truckType,
      totalWeightTons: Number(totalWeightTons) || 3.5,
      strategy,
    };

    try {
      let data = null;

      // 1. If running on localhost, attempt connection to C# microservice or Express proxy
      const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      if (isLocal) {
        try {
          const response = await api.post("/optimizer/route", payload);
          data = response.data;
        } catch (proxyErr) {
          try {
            const directRes = await fetch("http://localhost:5050/api/optimizer/route", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (directRes.ok) {
              data = await directRes.json();
            }
          } catch (_) {}
        }
      }

      // 2. If C# service is offline or app is running on cloud (Netlify HTTPS), use the high-speed hybrid solver
      if (!data) {
        data = solveRouteLocally(payload);
      }

      setResult(data);
      setError(null);
    } catch (err) {
      console.error("Optimization failed:", err);
      // Seamlessly fall back to client solver
      const fallbackData = solveRouteLocally(payload);
      setResult(fallbackData);
      setError(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner & Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            C# .NET 8 High-Performance Microservice
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Multi-Stop Route Optimization Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Solve the Traveling Salesperson Problem (TSP) & Capacitated Route Sequencing to cut deadheading, fuel cost, and tolls.
          </p>
        </div>

        {/* C# Engine Status Badge & Swagger Link */}
        <div className="flex items-center gap-3">
          <div
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
              engineStatus.isLocalCs
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-orange-500/10 border-orange-500/30 text-orange-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                engineStatus.isLocalCs ? "bg-emerald-400" : "bg-orange-400 animate-pulse"
              }`}
            />
            {engineStatus.isLocalCs
              ? "C# .NET Engine Connected (Port 5050)"
              : "Hybrid Engine Active (Cloud Mode)"}
          </div>

          <a
            href={typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:5050/swagger" : "https://github.com/Yashraj-2121/Freto/tree/main/services/Freto.RouteOptimizer"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
            title="Inspect interactive OpenAPI/Swagger Documentation"
          >
            <span>📜 {typeof window !== "undefined" && window.location.hostname === "localhost" ? "Swagger Docs" : "C# Service Code"}</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Form Inputs + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Route Configuration */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📍</span> Route Stops & Vehicle
              </h2>
              <button
                type="button"
                onClick={loadDemoPreset}
                className="text-xs text-orange-400 hover:text-orange-300 font-semibold underline"
              >
                Load Golden Corridor Demo
              </button>
            </div>

            <form onSubmit={handleOptimize} className="space-y-4">
              {/* Origin Hub */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  🏁 Origin Depot / Hub
                </label>
                <select
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  className="input bg-slate-950"
                >
                  {DEFAULT_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Waypoints / Stops */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    📦 Delivery Waypoints ({stops.length} stops)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="text-xs text-orange-400 hover:text-orange-300 font-bold"
                  >
                    + Add Stop
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {stops.map((stop, idx) => (
                    <div
                      key={stop.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2"
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <select
                          value={stop.name}
                          onChange={(e) => handleStopChange(stop.id, "name", e.target.value)}
                          className="input py-1 text-xs bg-slate-900"
                        >
                          {DEFAULT_CITIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="30"
                          value={stop.demandWeightTons}
                          onChange={(e) =>
                            handleStopChange(stop.id, "demandWeightTons", e.target.value)
                          }
                          className="input py-1 text-xs bg-slate-900"
                          placeholder="Drop Tons"
                          title="Drop-off weight in tons"
                        />
                      </div>
                      {stops.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(stop.id)}
                          className="text-red-400 hover:text-red-300 text-sm px-1.5"
                          title="Remove stop"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Destination vs Round-Trip */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-300">
                    🎯 Final Destination
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRoundTrip}
                      onChange={(e) => setIsRoundTrip(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-orange-500 focus:ring-0"
                    />
                    <span>Round-Trip Return to Base</span>
                  </label>
                </div>

                {!isRoundTrip && (
                  <select
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    className="input bg-slate-950"
                  >
                    {DEFAULT_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Vehicle & Payload Config */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    🚚 Truck Category
                  </label>
                  <select
                    value={truckType}
                    onChange={(e) => setTruckType(e.target.value)}
                    className="input text-xs bg-slate-950"
                  >
                    {TRUCK_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ⚖️ Initial Payload (Tons)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="40"
                    value={totalWeightTons}
                    onChange={(e) => setTotalWeightTons(e.target.value)}
                    className="input text-xs bg-slate-950"
                  />
                </div>
              </div>

              {/* Strategy Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ⚡ Optimization Strategy
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Balanced", "Fastest", "Cheapest"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStrategy(s)}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        strategy === s
                          ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Calculating Optimal Sequence in C#...
                  </>
                ) : (
                  <>
                    <span>⚡ Run C# Optimization Engine</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick CLI / Backend Info */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">💡 Running C# in FRETO:</div>
            <div>• C# Engine: <code className="text-orange-400">services/Freto.RouteOptimizer</code></div>
            <div>• Start command: <code className="text-orange-400">npm run dev:optimizer</code></div>
            <div>• Run tests: <code className="text-orange-400">npm run test:optimizer</code></div>
          </div>
        </div>

        {/* Right Section: Optimization Results */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <div className="font-bold mb-1">⚠️ Optimization Error</div>
              <p>{error}</p>
              <div className="mt-2 text-xs text-slate-400">
                To start the C# microservice in a terminal run:
                <pre className="mt-1 p-2 rounded bg-black/50 text-orange-300 font-mono">
                  npm run dev:optimizer
                </pre>
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="h-full min-h-[420px] rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center p-8 text-center bg-slate-900/20">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-3xl mb-4">
                🚚
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Ready to Optimize Route</h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md">
                Configure your origin hub and drop-off waypoints on the left, then click <strong>Run C# Optimization Engine</strong> to compute the mathematically optimal multi-stop sequence.
              </p>
              <button
                onClick={loadDemoPreset}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-orange-400 border border-slate-700 transition-colors"
              >
                Or Load Demo Scenario
              </button>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-fadeIn">
              {result.isLocalFallback && (
                <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/25 text-orange-300 text-xs flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <div>
                    <span className="font-semibold text-white">Cloud Deployment Mode:</span> Optimized using the In-Browser Engine (executing the exact same TSP 2-Opt & Branch-and-Bound algorithms as our C# backend). In local development, it communicates with the C# .NET 8 microservice at <code>http://localhost:5050</code>.
                  </div>
                </div>
              )}
              {/* Savings Highlight Banner */}
              {result.savings?.distanceSavedKm > 0 && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-slate-900 border border-emerald-500/40 shadow-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-base font-bold">
                      ✓
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Route Sequence Optimized Successfully!
                      </h3>
                      <p className="text-xs text-emerald-300">
                        {result.algorithm}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-emerald-500/20">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Distance Cut</span>
                      <span className="text-lg font-extrabold text-emerald-400">
                        {result.savings.distanceSavedKm} km
                        <span className="text-xs text-emerald-500 ml-1 font-semibold">
                          (-{result.savings.percentageDistanceSaved}%)
                        </span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Cost Savings</span>
                      <span className="text-lg font-extrabold text-emerald-400">
                        ₹{result.savings.costSavedInr.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Time Saved</span>
                      <span className="text-lg font-extrabold text-emerald-400">
                        ~{result.savings.hoursSaved} hrs
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block">CO₂ Cut</span>
                      <span className="text-lg font-extrabold text-emerald-400">
                        -{result.savings.co2SavedKg} kg
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Route Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="card bg-slate-900/90 border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Total Distance</span>
                  <span className="text-xl font-bold text-white">
                    {result.totalDistanceKm} km
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Original: {result.savings?.originalDistanceKm} km
                  </span>
                </div>

                <div className="card bg-slate-900/90 border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Transit Time</span>
                  <span className="text-xl font-bold text-white">
                    ~{result.totalDrivingHours} hrs
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Avg {result.truckSpecification?.averageSpeedKmh} km/h
                  </span>
                </div>

                <div className="card bg-slate-900/90 border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Fuel Needed</span>
                  <span className="text-xl font-bold text-white">
                    {result.costSummary?.estimatedFuelLiters} L
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    ₹{result.costSummary?.estimatedFuelCost.toLocaleString()}
                  </span>
                </div>

                <div className="card bg-slate-900/90 border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Total Fare (GST)</span>
                  <span className="text-xl font-bold text-orange-400">
                    ₹{result.costSummary?.totalEstimatedCost.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Tolls: ₹{result.costSummary?.estimatedTolls.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Waypoint Itinerary Timeline */}
              <div className="card bg-slate-900/90 border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    📋 Optimal Route Sequencing & Waypoint Legs
                  </h3>
                  <span className="text-xs text-slate-400">
                    {result.orderedWaypoints?.length} Total Points
                  </span>
                </div>

                <div className="space-y-4 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                  {result.legs?.map((leg) => (
                    <div key={leg.legIndex} className="relative flex items-start gap-4 pl-8">
                      {/* Timeline Dot */}
                      <span className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-slate-900 -translate-x-1/2" />

                      <div className="flex-1 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-orange-400">
                              Leg #{leg.legIndex}
                            </span>
                            <span className="text-xs text-slate-500">→</span>
                            <span className="text-sm font-bold text-white">
                              {leg.from.name} to {leg.to.name}
                            </span>
                          </div>
                          {leg.to.notes && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {leg.to.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          <div>
                            <span className="text-slate-500 block">Distance</span>
                            <span className="font-semibold text-slate-200">
                              {leg.distanceKm} km
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Driving</span>
                            <span className="font-semibold text-slate-200">
                              ~{leg.estimatedHours}h
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Fuel Cost</span>
                            <span className="font-semibold text-slate-200">
                              ₹{leg.fuelCost.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Payload</span>
                            <span className="font-semibold text-orange-300">
                              {leg.currentPayloadTons}T
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
