import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { api } from "../api/client.js";

// Custom truck icon for Leaflet
const truckIcon = L.divIcon({
  className: "custom-truck-icon",
  html: `<div style="background-color: #F0740A; color: white; border: 3px solid white; border-radius: 50%; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 0 15px rgba(240,116,10,0.8);">🚛</div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

const originIcon = L.divIcon({
  className: "origin-icon",
  html: `<div style="background-color: #10B981; color: white; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const destIcon = L.divIcon({
  className: "dest-icon",
  html: `<div style="background-color: #EF4444; color: white; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">🎯</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Helper component to center map smoothly when position updates
function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.panTo(coords, { animate: true });
    }
  }, [coords, map]);
  return null;
}

export default function TripTrackingPage() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null);
  const [routePolyline, setRoutePolyline] = useState(null);

  useEffect(() => {
    fetchTrip();
  }, [tripId]);

  async function fetchTrip() {
    try {
      setLoading(true);
      if (tripId) {
        const { data } = await api.get(`/trips/${tripId}`);
        setTrip(data.trip);
      } else {
        // Find default active trip
        const { data } = await api.get("/trips/mine");
        if (data && data.length > 0) {
          setTrip(data[0]);
        }
      }
    } catch (err) {
      console.error("Trip fetch err:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulate() {
    if (!trip) return;
    setSimulating(true);
    setStatusNotice(null);
    try {
      const { data } = await api.post(`/trips/${trip._id}/simulate`);
      setTrip(data.trip);
      setStatusNotice(data.message);
    } catch (err) {
      console.error(err);
      alert("Failed to simulate trip movement.");
    } finally {
      setSimulating(false);
    }
  }

  const truckPos = trip?.currentCoordinates
    ? [trip.currentCoordinates.lat, trip.currentCoordinates.lng]
    : [22.3072, 73.1812];

  const originPos = trip?.originCoordinates
    ? [trip.originCoordinates.lat, trip.originCoordinates.lng]
    : [19.076, 72.8777];

  const destPos = trip?.destinationCoordinates
    ? [trip.destinationCoordinates.lat, trip.destinationCoordinates.lng]
    : [28.6139, 77.209];

  useEffect(() => {
    if (trip && trip.originCoordinates && trip.destinationCoordinates && !routePolyline) {
      const o = trip.originCoordinates;
      const d = trip.destinationCoordinates;
      fetch(`https://router.project-osrm.org/route/v1/driving/${o.lng},${o.lat};${d.lng},${d.lat}?overview=full&geometries=geojson`)
        .then((res) => res.json())
        .then((data) => {
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
            setRoutePolyline(coords);
          }
        })
        .catch(err => console.error("OSRM fetch error", err));
    }
  }, [trip]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Live GPS Telemetry Active
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Live Highway Trip Tracking Map
          </h1>
          <p className="text-sm text-slate-400">
            Real-time coordinates streamed from vehicle onboard GPS. OpenStreetMap highway routing.
          </p>
        </div>

        {/* Live Simulation Button for Teacher Presentation */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulate}
            disabled={simulating || trip?.status === "DELIVERED"}
            className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 shadow-lg shadow-orange-500/30"
          >
            <span>{simulating ? "Updating GPS..." : "🚀 Simulate Truck Movement"}</span>
          </button>
          <Link to="/bookings" className="btn-secondary text-xs py-2.5">
            View Invoices
          </Link>
        </div>
      </div>

      {statusNotice && (
        <div className="p-3.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-medium animate-fadeIn">
          {statusNotice}
        </div>
      )}

      {loading ? (
        <div className="card text-center py-20 text-slate-400">Loading live GPS map and telemetry...</div>
      ) : !trip ? (
        <div className="card text-center py-16 space-y-4">
          <div className="text-4xl">🗺️</div>
          <h3 className="text-lg font-bold text-white">No active trip found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Book a freight load or run the database seed to launch a live GPS tracking journey!
          </p>
          <Link to="/loads/new" className="btn-primary text-xs inline-block">
            Post Freight & Book Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Column (2/3 width) */}
          <div className="lg:col-span-2 card p-0 overflow-hidden border-slate-800 rounded-2xl h-[520px] relative z-0">
            <MapContainer
              center={truckPos}
              zoom={6}
              scrollWheelZoom={false}
              className="w-full h-full"
              style={{ minHeight: "100%", background: "#0B1522" }}
            >
              <ChangeMapView coords={truckPos} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Origin Marker */}
              <Marker position={originPos} icon={originIcon}>
                <Popup>
                  <div className="text-xs font-sans">
                    <b className="text-emerald-700">Origin:</b> {trip.originCity}
                  </div>
                </Popup>
              </Marker>

              {/* Destination Marker */}
              <Marker position={destPos} icon={destIcon}>
                <Popup>
                  <div className="text-xs font-sans">
                    <b className="text-red-700">Destination:</b> {trip.destinationCity}
                  </div>
                </Popup>
              </Marker>

              {/* Live Truck Marker */}
              <Marker position={truckPos} icon={truckIcon}>
                <Popup>
                  <div className="text-xs font-sans space-y-1">
                    <div className="font-bold text-slate-900">{trip.truckId?.truckNumber}</div>
                    <div>Driver: {trip.driverName}</div>
                    <div>Speed: {trip.speedKmH} km/h</div>
                    <div>Progress: {Math.round(trip.progressPercent)}%</div>
                  </div>
                </Popup>
              </Marker>

              {/* Route Polyline */}
              <Polyline
                positions={routePolyline || [originPos, truckPos, destPos]}
                color="#F0740A"
                weight={4}
                opacity={0.8}
                dashArray={routePolyline ? "" : "6, 8"}
              />
            </MapContainer>

            {/* Float overlay status badge on top right of map */}
            <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
              <div className="flex items-center gap-2 font-mono font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>GPS FIX: ACTIVE</span>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Lat: {truckPos[0].toFixed(4)} | Lng: {truckPos[1].toFixed(4)}
              </div>
            </div>
          </div>

          {/* Telemetry & Driver Panel (1/3 width) */}
          <div className="space-y-4">
            {/* Trip Progress Card */}
            <div className="card p-5 border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="badge bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono text-xs">
                  {trip.status}
                </span>
                <span className="text-xs text-slate-400">ETA: {trip.estimatedArrival}</span>
              </div>

              {/* Route Heading */}
              <div>
                <div className="text-xs text-slate-400 font-medium">Highway Transit Route</div>
                <div className="text-lg font-black text-white flex items-center gap-2 mt-0.5">
                  <span>{trip.originCity}</span>
                  <span className="text-orange-500">➔</span>
                  <span>{trip.destinationCity}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Distance Completed</span>
                  <span className="text-orange-400 font-mono">{Math.round(trip.progressPercent)}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-amber-400 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, trip.progressPercent)}%` }}
                  />
                </div>
              </div>

              {/* Telemetry stats */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <span className="text-[10px] text-slate-400 block">Cruising Speed</span>
                  <span className="text-lg font-black text-white font-mono">{trip.speedKmH} km/h</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <span className="text-[10px] text-slate-400 block">Assigned Truck</span>
                  <span className="text-xs font-bold text-orange-400 font-mono truncate block">
                    {trip.truckId?.truckNumber || "MH-04-AB-1234"}
                  </span>
                </div>
              </div>
            </div>

            {/* Driver Contact Card */}
            <div className="card p-5 border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Assigned Truck Pilot
              </h4>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-lg">
                  👨🏽‍✈️
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{trip.driverName}</div>
                  <div className="text-xs text-slate-400">Highway Logistics Specialist</div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Driver Phone:</span>
                <span className="text-orange-400 font-mono font-bold">{trip.driverPhone}</span>
              </div>
            </div>

            {/* Route Waypoints Timeline */}
            <div className="card p-5 border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Route Waypoints Log
              </h4>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 text-xs">
                {trip.routeHistory && trip.routeHistory.length > 0 ? (
                  trip.routeHistory.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-300">
                      <span className="text-orange-400 mt-0.5">•</span>
                      <div>
                        <div className="font-medium text-white">{item.statusNote}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs">Trip just dispatched. No waypoints logged.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
