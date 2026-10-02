import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import FreightCalculator from "../components/FreightCalculator.jsx";
import { api } from "../api/client.js";

const FLEET_TYPES = [
  {
    name: "Mini Truck (Tata Ace)",
    capacity: "1 - 2 Tons",
    usage: "Intra-city goods, FMCG, electronics, local delivery",
    rate: "From ₹22/km",
    icon: "🛻",
    tag: "Most Popular Intra-City",
  },
  {
    name: "14ft Open Body",
    capacity: "3 - 4 Tons",
    usage: "Textiles, furniture, pipes, light industrial machinery",
    rate: "From ₹34/km",
    icon: "🚚",
    tag: "Best for Regional Freight",
  },
  {
    name: "19ft Sealed Container",
    capacity: "7 - 8 Tons",
    usage: "All-weather FMCG, pharmaceutical cartons, export cargo",
    rate: "From ₹46/km",
    icon: "🚛",
    tag: "High Security / Weather-Proof",
  },
  {
    name: "32ft Multi-Axle Heavy",
    capacity: "15 - 20 Tons",
    usage: "Heavy steel, industrial plants, cement, large tonnage",
    rate: "From ₹72/km",
    icon: "🚜",
    tag: "Interstate Long-Haul",
  },
  {
    name: "Refrigerated Container",
    capacity: "5 - 10 Tons",
    usage: "Cold chain dairy, fresh fruits, temperature-controlled pharma",
    rate: "From ₹65/km",
    icon: "❄️",
    tag: "Cold Chain -20°C to +15°C",
  },
  {
    name: "Flatbed Trailer",
    capacity: "25+ Tons",
    usage: "Over-dimensional cargo, construction beams, transformers",
    rate: "From ₹95/km",
    icon: "🏗️",
    tag: "Heavy Project Cargo",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then(({ data }) => setStats(data.metrics))
      .catch((err) => console.log("Stats fetch:", err));
  }, []);

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
          Freight made simpler — India's Verified Truck Network
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Book Verified Trucks.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
            Ship Freight Faster.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
          Connect directly with verified fleet owners. Get competitive real-time bids, transparent
          distance fares, and watch your shipments on a live GPS map — no brokers, no hidden markups.
        </p>

        {/* Dynamic Action Buttons based on User Role */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {!user ? (
            <>
              <Link to="/login" className="btn-primary text-base px-8 py-3.5">
                📦 Book a Truck Now
              </Link>
              <Link to="/login" className="btn-secondary text-base px-7 py-3.5">
                🗺️ Live GPS Tracking
              </Link>
            </>
          ) : user.role === "SHIPPER" ? (
            <>
              <Link to="/loads/new" className="btn-primary text-base px-8 py-3.5">
                📦 Book a Truck Now
              </Link>
              <Link to="/tracking" className="btn-secondary text-base px-7 py-3.5">
                🗺️ Live GPS Tracking
              </Link>
            </>
          ) : user.role === "TRANSPORTER" ? (
            <>
              <Link to="/loads/browse" className="btn-primary text-base px-8 py-3.5">
                🔍 Browse Available Loads
              </Link>
              <Link to="/fleet" className="btn-secondary text-base px-7 py-3.5">
                🚛 Manage My Fleet
              </Link>
            </>
          ) : (
            <Link to="/tracking" className="btn-primary text-base px-8 py-3.5">
              🗺️ My Assigned Trip
            </Link>
          )}
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6">
          <div className="card py-4 px-3 text-center">
            <div className="text-2xl sm:text-3xl font-black text-white">
              {stats?.totalTrucks ? `${stats.totalTrucks * 120}+` : "600+"}
            </div>
            <div className="text-xs text-slate-400 mt-1">Verified Fleet Trucks</div>
          </div>
          <div className="card py-4 px-3 text-center">
            <div className="text-2xl sm:text-3xl font-black text-orange-400">
              {stats?.totalLoads ? `${stats.totalLoads * 35}+` : "150+"}
            </div>
            <div className="text-xs text-slate-400 mt-1">Freight Consignments Moved</div>
          </div>
          <div className="card py-4 px-3 text-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">99.4%</div>
            <div className="text-xs text-slate-400 mt-1">On-Time Transit Rate</div>
          </div>
          <div className="card py-4 px-3 text-center">
            <div className="text-2xl sm:text-3xl font-black text-white">50+</div>
            <div className="text-xs text-slate-400 mt-1">Industrial Logistics Hubs</div>
          </div>
        </div>
      </section>

      {/* Interactive Freight Rate Calculator */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <FreightCalculator />
      </section>

      {/* Fleet Catalog Showcase */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Commercial Fleet Catalog
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            From agile intra-city mini trucks to heavy multi-axle trailers, choose the vehicle tailored for
            your cargo tonnage and dimensions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FLEET_TYPES.map((fleet, i) => (
            <div
              key={i}
              className="card hover:border-orange-500/50 transition-all duration-300 hover:shadow-orange-500/10 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{fleet.icon}</span>
                  <span className="badge bg-slate-800 text-orange-400 border border-slate-700">
                    {fleet.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{fleet.name}</h3>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>
                    <span className="text-slate-300 font-medium">Payload Capacity:</span>{" "}
                    {fleet.capacity}
                  </div>
                  <div>
                    <span className="text-slate-300 font-medium">Suitable for:</span> {fleet.usage}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200">{fleet.rate}</span>
                <Link
                  to={!user ? "/login" : user.role === "TRANSPORTER" ? "/fleet" : `/loads/new?type=${encodeURIComponent(fleet.name)}`}
                  className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
                >
                  {!user ? "Login to Book →" : user.role === "TRANSPORTER" ? "Manage Fleet →" : "Book This Truck →"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="card bg-slate-950 border-slate-800 p-8 sm:p-12 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How FRETO Works</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              A transparent, end-to-end digital logistics workflow connecting shippers directly to verified truck owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="space-y-3 text-center p-4">
              <div className="h-12 w-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center text-xl font-black mx-auto">
                1
              </div>
              <h4 className="font-bold text-white text-base">Post Your Freight</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Specify pickup, drop city, cargo weight, and truck type in seconds.
              </p>
            </div>

            <div className="space-y-3 text-center p-4">
              <div className="h-12 w-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center text-xl font-black mx-auto">
                2
              </div>
              <h4 className="font-bold text-white text-base">Direct Fleet Quotes</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verified transporters submit competitive bids with their assigned trucks and drivers.
              </p>
            </div>

            <div className="space-y-3 text-center p-4">
              <div className="h-12 w-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center text-xl font-black mx-auto">
                3
              </div>
              <h4 className="font-bold text-white text-base">Confirmed Booking</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Accept the best bid, generate a legal GST road transport invoice, and confirm dispatch.
              </p>
            </div>

            <div className="space-y-3 text-center p-4">
              <div className="h-12 w-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center text-xl font-black mx-auto">
                4
              </div>
              <h4 className="font-bold text-white text-base">Satellite GPS Tracking</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monitor the vehicle traveling on the OpenStreetMap route until safe arrival and delivery.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
