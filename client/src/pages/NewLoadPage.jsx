import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../api/client.js";

const POPULAR_CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata",
  "Ahmedabad", "Hyderabad", "Pune", "Jaipur", "Surat", "Nagpur", "Indore",
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

export default function NewLoadPage() {
  const [searchParams] = useSearchParams();
  
  const [form, setForm] = useState({
    title: "",
    originCity: searchParams.get("origin") || POPULAR_CITIES[0],
    originAddress: "",
    destinationCity: searchParams.get("dest") || POPULAR_CITIES[1],
    destinationAddress: "",
    cargoType: CARGO_TYPES[0],
    weightTons: searchParams.get("weight") || "3",
    truckTypeNeeded: searchParams.get("type") || TRUCK_TYPES[1],
    distanceKm: searchParams.get("distance") || "",
    budget: searchParams.get("budget") || "",
    pickupDate: "",
    notes: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  
  // To prevent overwriting the user's manual budget entry, we only auto-calc when dependencies change
  const [autoUpdateBudget, setAutoUpdateBudget] = useState(true);

  function update(field, value) {
    if (field === "budget") setAutoUpdateBudget(false); // User manually typed budget
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Automatic Price Estimation Engine!
  useEffect(() => {
    if (!autoUpdateBudget) return;
    
    const getEstimate = async () => {
      // Allow calculation if we have distance OR cities, along with weight and truck type
      if ((!form.originCity || !form.destinationCity) && !form.distanceKm) return;
      if (!form.weightTons) return;
      
      setCalculating(true);
      try {
        const { data } = await api.post("/calculator", {
          originCity: form.originCity,
          destinationCity: form.destinationCity,
          truckType: form.truckTypeNeeded,
          weightTons: Number(form.weightTons),
          distanceKm: form.distanceKm ? Number(form.distanceKm) : undefined
        });
        if (data && data.totalEstimatedFare) {
          setForm(f => ({ 
            ...f, 
            budget: data.totalEstimatedFare, 
            distanceKm: data.distanceKm // sync with backend's calculated distance if left blank
          }));
        }
      } catch (err) {
        console.error("Failed to calculate estimate", err);
      } finally {
        setCalculating(false);
      }
    };

    // Debounce slightly so it doesn't spam the API while typing
    const timer = setTimeout(() => {
      getEstimate();
    }, 400);
    return () => clearTimeout(timer);
  }, [form.originCity, form.destinationCity, form.truckTypeNeeded, form.weightTons, form.distanceKm, autoUpdateBudget]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/loads", {
        ...form,
        weightTons: Number(form.weightTons),
        budget: Number(form.budget),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <div className="card p-8 border-green-500/30 max-w-md w-full bg-slate-900/90 shadow-2xl">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Load Posted Successfully!</h2>
          <p className="text-slate-400 mb-6">Your freight load is now live on the marketplace. Transporters can now place bids.</p>
          <Link to="/loads/my-loads" className="btn-primary inline-block">View My Loads</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Post a New Load</h1>
        <p className="text-slate-400">Fill in the details below. Our pricing engine will automatically estimate the optimal budget.</p>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-6 card p-6 sm:p-8 border-orange-500/20 bg-slate-900/80">
        
        <Field label="Load Title / Short Description">
          <input className="input" placeholder="e.g. 5 Tons of Steel Pipes to Delhi" value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
          <Field label="Origin City">
            <select className="input bg-slate-900" value={form.originCity} onChange={(e) => { update("originCity", e.target.value); setAutoUpdateBudget(true); }}>
              {POPULAR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Destination City">
            <select className="input bg-slate-900" value={form.destinationCity} onChange={(e) => { update("destinationCity", e.target.value); setAutoUpdateBudget(true); }}>
              {POPULAR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          
          <Field label="Exact Pickup Address (Optional)">
            <input className="input bg-slate-900" placeholder="Warehouse address" value={form.originAddress} onChange={(e) => update("originAddress", e.target.value)} />
          </Field>
          <Field label="Exact Drop Address (Optional)">
            <input className="input bg-slate-900" placeholder="Delivery address" value={form.destinationAddress} onChange={(e) => update("destinationAddress", e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <div className="sm:col-span-2">
            <Field label="Recommended Truck Type">
              <select className="input" value={form.truckTypeNeeded} onChange={(e) => { update("truckTypeNeeded", e.target.value); setAutoUpdateBudget(true); }}>
                {TRUCK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Weight (Tons)">
            <input type="number" step="0.1" min="0.5" className="input" value={form.weightTons} onChange={(e) => { update("weightTons", e.target.value); setAutoUpdateBudget(true); }} required />
          </Field>
          <Field label="Route Distance (km)">
            <input type="number" placeholder="e.g. 500" className="input" value={form.distanceKm} onChange={(e) => { update("distanceKm", e.target.value); setAutoUpdateBudget(true); }} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Cargo / Material Type">
            <select className="input" value={form.cargoType} onChange={(e) => update("cargoType", e.target.value)}>
              {CARGO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Pickup Date & Time">
            <input type="datetime-local" className="input" value={form.pickupDate} onChange={(e) => update("pickupDate", e.target.value)} required />
          </Field>
        </div>
        
        <Field label="Additional Notes (Optional)">
          <textarea className="input min-h-[80px]" placeholder="Special handling requirements, fragile items, etc." value={form.notes} onChange={(e) => update("notes", e.target.value)} />
        </Field>

        {/* Dynamic Budget Display */}
        <div className="mt-8 p-5 bg-orange-500/10 border border-orange-500/30 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-orange-400 font-semibold mb-1 flex items-center gap-2">
              💰 Target Freight Budget
              {calculating && <span className="text-xs text-orange-300 animate-pulse">(Calculating...)</span>}
            </h3>
            <p className="text-xs text-slate-400">Our pricing engine automatically estimated this based on distance & truck type.</p>
          </div>
          <div className="w-full sm:w-1/3 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
            <input 
              type="number" 
              className="input pl-8 text-lg font-bold text-white bg-slate-950 border-orange-500/50" 
              value={form.budget} 
              onChange={(e) => update("budget", e.target.value)} 
              required 
            />
          </div>
        </div>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">{error}</div>}

        <button type="submit" disabled={loading || calculating} className="btn-primary w-full py-3 text-lg font-bold">
          {loading ? "Posting Load..." : "Post Load to Marketplace"}
        </button>
      </form>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm text-slate-300 mb-1.5 font-medium">{label}</span>
      {children}
    </label>
  );
}
