import { useState } from "react";
import { api } from "../api/client.js";

const VEHICLE_TYPES = ["OPEN_TRUCK", "CONTAINER", "TRAILER", "TANKER", "REFRIGERATED", "MINI_TRUCK", "OTHER"];

const initialForm = {
  pickupAddress: "",
  pickupLat: "",
  pickupLng: "",
  dropAddress: "",
  dropLat: "",
  dropLng: "",
  vehicleType: VEHICLE_TYPES[0],
  weightKg: "",
  materialType: "",
  pickupWindowStart: "",
  pickupWindowEnd: "",
  targetFreightPaise: "",
};

export default function NewLoadPage() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/loads", {
        ...form,
        pickupLat: Number(form.pickupLat),
        pickupLng: Number(form.pickupLng),
        dropLat: Number(form.dropLat),
        dropLng: Number(form.dropLng),
        weightKg: Number(form.weightKg),
        targetFreightPaise: form.targetFreightPaise ? Number(form.targetFreightPaise) : undefined,
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
        <p className="text-xl">Load saved as draft. Post it from your dashboard to start receiving bids.</p>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-8">Post a Load</h1>
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Pickup address">
          <input className="input" value={form.pickupAddress} onChange={(e) => update("pickupAddress", e.target.value)} required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Pickup lat">
            <input className="input" value={form.pickupLat} onChange={(e) => update("pickupLat", e.target.value)} required />
          </Field>
          <Field label="Pickup lng">
            <input className="input" value={form.pickupLng} onChange={(e) => update("pickupLng", e.target.value)} required />
          </Field>
        </div>

        <Field label="Drop address">
          <input className="input" value={form.dropAddress} onChange={(e) => update("dropAddress", e.target.value)} required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Drop lat">
            <input className="input" value={form.dropLat} onChange={(e) => update("dropLat", e.target.value)} required />
          </Field>
          <Field label="Drop lng">
            <input className="input" value={form.dropLng} onChange={(e) => update("dropLng", e.target.value)} required />
          </Field>
        </div>

        <Field label="Vehicle type">
          <select className="input" value={form.vehicleType} onChange={(e) => update("vehicleType", e.target.value)}>
            {VEHICLE_TYPES.map((v) => (
              <option key={v} value={v}>
                {v.replace("_", " ")}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Weight (kg)">
            <input className="input" value={form.weightKg} onChange={(e) => update("weightKg", e.target.value)} required />
          </Field>
          <Field label="Material type">
            <input className="input" value={form.materialType} onChange={(e) => update("materialType", e.target.value)} required />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Pickup window start">
            <input
              type="datetime-local"
              className="input"
              value={form.pickupWindowStart}
              onChange={(e) => update("pickupWindowStart", e.target.value)}
              required
            />
          </Field>
          <Field label="Pickup window end">
            <input
              type="datetime-local"
              className="input"
              value={form.pickupWindowEnd}
              onChange={(e) => update("pickupWindowEnd", e.target.value)}
              required
            />
          </Field>
        </div>

        <Field label="Target freight (paise, optional)">
          <input className="input" value={form.targetFreightPaise} onChange={(e) => update("targetFreightPaise", e.target.value)} />
        </Field>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Saving…" : "Save as Draft"}
        </button>
      </form>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm text-white/70 mb-1">{label}</span>
      {children}
    </label>
  );
}
