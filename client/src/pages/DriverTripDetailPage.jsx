import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { getSocket } from "../api/socket.js";

// Mirrors the server's transition table so the UI only ever offers valid
// next steps — the server still re-validates and is the source of truth.
const NEXT_STATUS = {
  ASSIGNED: "EN_ROUTE_TO_PICKUP",
  EN_ROUTE_TO_PICKUP: "ARRIVED_AT_PICKUP",
  ARRIVED_AT_PICKUP: "LOADED",
  LOADED: "IN_TRANSIT",
  IN_TRANSIT: "ARRIVED_AT_DROP",
  ARRIVED_AT_DROP: "UNLOADED",
  POD_UPLOADED: "COMPLETED",
};

const TRACKABLE = ["EN_ROUTE_TO_PICKUP", "ARRIVED_AT_PICKUP", "LOADED", "IN_TRANSIT", "ARRIVED_AT_DROP"];

export default function DriverTripDetailPage() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [podFile, setPodFile] = useState(null);
  const watchIdRef = useRef(null);

  async function refresh() {
    try {
      const { data } = await api.get(`/trips/${tripId}`);
      setTrip(data);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load trip");
    }
  }

  useEffect(() => {
    refresh();
    const socket = getSocket();
    socket.connect();
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      socket.disconnect();
    };
  }, [tripId]);

  async function advanceStatus() {
    const next = NEXT_STATUS[trip.status];
    if (!next) return;
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/trips/${tripId}/status`, { status: next });
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to update status");
    } finally {
      setBusy(false);
    }
  }

  function toggleTracking() {
    if (tracking) {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      setTracking(false);
      return;
    }

    const socket = getSocket();
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        socket.emit("ping:send", {
          tripId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speedKmh: pos.coords.speed ? pos.coords.speed * 3.6 : undefined,
          recordedAt: new Date().toISOString(),
        });
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    setTracking(true);
  }

  async function uploadPod() {
    if (!podFile) return;
    setBusy(true);
    setError(null);
    try {
      const { data: urlData } = await api.post("/documents/upload-url", {
        type: "POD",
        contentType: podFile.type || "image/jpeg",
      });
      await fetch(urlData.uploadUrl, { method: "PUT", body: podFile, headers: { "Content-Type": podFile.type } });
      await api.post(`/trips/${tripId}/documents`, { type: "POD", fileUrl: urlData.fileUrl });
      await refresh();
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to upload POD");
    } finally {
      setBusy(false);
    }
  }

  if (!trip) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        {error ? <p className="text-red-400">{error}</p> : <p className="text-white/50">Loading…</p>}
      </main>
    );
  }

  const next = NEXT_STATUS[trip.status];

  return (
    <main className="max-w-xl mx-auto px-6 py-16 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">
          {trip.Booking?.Load?.pickupAddress} → {trip.Booking?.Load?.dropAddress}
        </h1>
        <p className="text-white/60">
          Status: <span className="text-freto-orange">{trip.status}</span>
        </p>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {next && (
        <button onClick={advanceStatus} disabled={busy} className="btn-primary w-full">
          {busy ? "Updating…" : `Mark as ${next.replace(/_/g, " ")}`}
        </button>
      )}

      {TRACKABLE.includes(trip.status) && (
        <div className="rounded-xl border border-white/15 p-5">
          <p className="font-semibold mb-3">Live location sharing</p>
          <button onClick={toggleTracking} className={tracking ? "btn-outline w-full" : "btn-primary w-full"}>
            {tracking ? "Stop sharing location" : "Start sharing location"}
          </button>
        </div>
      )}

      {trip.status === "UNLOADED" && (
        <div className="rounded-xl border border-white/15 p-5 space-y-3">
          <p className="font-semibold">Upload Proof of Delivery</p>
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setPodFile(e.target.files[0])} />
          <button onClick={uploadPod} disabled={busy || !podFile} className="btn-primary w-full">
            {busy ? "Uploading…" : "Upload POD"}
          </button>
        </div>
      )}
    </main>
  );
}
