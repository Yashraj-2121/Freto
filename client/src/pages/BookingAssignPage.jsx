import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client.js";

export default function BookingAssignPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [truckId, setTruckId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/trucks"), api.get("/drivers")])
      .then(([t, d]) => {
        setTrucks(t.data.filter((truck) => truck.isActive));
        setDrivers(d.data);
      })
      .catch((err) => setError(err.response?.data?.message ?? "Failed to load fleet"));
  }, []);

  async function assign(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { data: trip } = await api.post(`/bookings/${bookingId}/assign`, { truckId, driverId });
      navigate(`/trips/${trip.id}/track`);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to assign");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-8">Assign Truck & Driver</h1>
      <p className="text-white/50 text-sm mb-6">Booking {bookingId}</p>

      <form onSubmit={assign} className="space-y-4">
        <label className="block">
          <span className="block text-sm text-white/70 mb-1">Truck</span>
          <select className="input" value={truckId} onChange={(e) => setTruckId(e.target.value)} required>
            <option value="" disabled>
              Select a truck
            </option>
            {trucks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.registrationNumber} — {t.vehicleType.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-sm text-white/70 mb-1">Driver</span>
          <select className="input" value={driverId} onChange={(e) => setDriverId(e.target.value)} required>
            <option value="" disabled>
              Select a driver
            </option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.drivingLicence}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "Assigning…" : "Assign & Start Trip"}
        </button>
      </form>
    </main>
  );
}
