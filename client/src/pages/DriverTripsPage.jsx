import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";

export default function DriverTripsPage() {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/trips/mine")
      .then(({ data }) => setTrips(data))
      .catch((err) => setError(err.response?.data?.message ?? "Failed to load trips"));
  }, []);

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-8">My Trips</h1>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {trips.length === 0 && !error && <p className="text-white/50">No trips assigned yet.</p>}

      <div className="space-y-3">
        {trips.map((trip) => (
          <Link
            key={trip.id}
            to={`/driver/trips/${trip.id}`}
            className="block rounded-xl border border-white/15 p-5 hover:border-freto-orange transition-colors"
          >
            <p className="font-semibold">
              {trip.Booking?.Load?.pickupAddress} → {trip.Booking?.Load?.dropAddress}
            </p>
            <p className="text-sm text-white/60 mt-1">Status: {trip.status}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
