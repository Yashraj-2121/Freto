import { useState, useEffect } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

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

export default function FleetPage() {
  const { user, quickDemoLogin } = useAuth();
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    truckNumber: "",
    truckType: "14ft Open Body (3-4 Ton)",
    capacityTons: 4,
    baseRatePerKm: 35,
    driverName: "Karan Johal",
    driverPhone: "+91 98112 34567",
    currentCity: "Mumbai",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFleet();
  }, []);

  async function fetchFleet() {
    try {
      setLoading(true);
      const { data } = await api.get("/trucks");
      setTrucks(data.trucks);
    } catch (err) {
      console.error("Fleet fetch err:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTruck(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      let currentUser = user;
      if (!currentUser) {
        currentUser = await quickDemoLogin("TRANSPORTER");
      }
      const transporterId = currentUser?.id || currentUser?._id;

      await api.post("/trucks", {
        ...formData,
        transporterId,
        capacityTons: Number(formData.capacityTons),
        baseRatePerKm: Number(formData.baseRatePerKm),
      });
      setShowAddModal(false);
      setFormData({
        truckNumber: "",
        truckType: "14ft Open Body (3-4 Ton)",
        capacityTons: 4,
        baseRatePerKm: 35,
        driverName: "Karan Johal",
        driverPhone: "+91 98112 34567",
        currentCity: "Mumbai",
      });
      fetchFleet();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add truck.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(truck) {
    const nextStatus = truck.status === "Available" ? "Maintenance" : "Available";
    try {
      await api.put(`/trucks/${truck._id}`, { status: nextStatus });
      fetchFleet();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteTruck(truckId) {
    if (!confirm("Are you sure you want to remove this truck from your fleet?")) return;
    try {
      await api.delete(`/trucks/${truckId}`);
      fetchFleet();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-2">
            🚚 Transporter Garage
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Fleet & Vehicle Management
          </h1>
          <p className="text-sm text-slate-400">
            Register and manage your commercial trucks, assign drivers, and monitor operational readiness.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs">
          + Add New Truck to Fleet
        </button>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Total Registered Fleet</div>
            <div className="text-2xl font-black text-white">{trucks.length} Vehicles</div>
          </div>
          <span className="text-3xl">🚛</span>
        </div>
        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Available for Dispatch</div>
            <div className="text-2xl font-black text-emerald-400">
              {trucks.filter((t) => t.status === "Available").length} Ready
            </div>
          </div>
          <span className="text-3xl">🟢</span>
        </div>
        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">On Active Highway Trips</div>
            <div className="text-2xl font-black text-orange-400">
              {trucks.filter((t) => t.status === "On Trip").length} En Route
            </div>
          </div>
          <span className="text-3xl">🛣️</span>
        </div>
      </div>

      {/* Trucks Table */}
      <div className="card overflow-hidden border-slate-800 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] border-b border-slate-800 tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Truck Number</th>
                <th className="py-3.5 px-4 font-semibold">Vehicle Type</th>
                <th className="py-3.5 px-4 font-semibold">Capacity</th>
                <th className="py-3.5 px-4 font-semibold">Driver & Contact</th>
                <th className="py-3.5 px-4 font-semibold">Location</th>
                <th className="py-3.5 px-4 font-semibold">Base Rate</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    Loading registered fleet...
                  </td>
                </tr>
              ) : trucks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No trucks registered yet. Click "+ Add New Truck" to add your first commercial vehicle!
                  </td>
                </tr>
              ) : (
                trucks.map((truck) => (
                  <tr key={truck._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {truck.truckNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">{truck.truckType}</td>
                    <td className="py-3.5 px-4 font-semibold text-orange-400">
                      {truck.capacityTons} Tons
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{truck.driverName}</div>
                      <div className="text-[11px] text-slate-400">{truck.driverPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">{truck.currentCity}</td>
                    <td className="py-3.5 px-4 font-mono font-medium">₹{truck.baseRatePerKm}/km</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`badge ${
                          truck.status === "Available"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : truck.status === "On Trip"
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {truck.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => toggleStatus(truck)}
                        className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                        title="Toggle Maintenance"
                      >
                        {truck.status === "Available" ? "Mark Maint." : "Mark Ready"}
                      </button>
                      <button
                        onClick={() => handleDeleteTruck(truck._id)}
                        className="text-[11px] text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-950/40"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Truck Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-lg w-full bg-slate-900 border-slate-700 p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add New Commercial Truck</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTruck} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Registration Plate No.
                  </label>
                  <input
                    type="text"
                    className="input uppercase font-mono"
                    placeholder="MH-04-XX-9999"
                    value={formData.truckNumber}
                    onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Current Base City
                  </label>
                  <select
                    className="input"
                    value={formData.currentCity}
                    onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                  >
                    {POPULAR_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Truck Model & Body Type</label>
                <select
                  className="input"
                  value={formData.truckType}
                  onChange={(e) => setFormData({ ...formData, truckType: e.target.value })}
                >
                  {TRUCK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Payload Capacity (Tons)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    className="input"
                    value={formData.capacityTons}
                    onChange={(e) => setFormData({ ...formData, capacityTons: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Base Rate (₹ / km)
                  </label>
                  <input
                    type="number"
                    min="10"
                    className="input"
                    value={formData.baseRatePerKm}
                    onChange={(e) => setFormData({ ...formData, baseRatePerKm: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Driver Name</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Driver Mobile No.</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary text-xs px-5">
                  {submitting ? "Adding..." : "Register Truck"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
