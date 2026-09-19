import { useState } from "react";
import { api } from "../api/client.js";

const DOC_TYPES = ["PAN", "GST_CERTIFICATE", "ADDRESS_PROOF", "BANK_PROOF"];

export default function KycSubmitPage() {
  const [type, setType] = useState(DOC_TYPES[0]);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { data: urlData } = await api.post("/kyc/upload-url", {
        type,
        contentType: file.type || "application/octet-stream",
      });
      await fetch(urlData.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      await api.post("/kyc/documents", { type, fileUrl: urlData.fileUrl });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to submit document");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <p className="text-xl">
          Document submitted for review. You'll be notified once it's approved.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-8">Submit KYC Document</h1>
      <form onSubmit={submit} className="space-y-5">
        <label className="block">
          <span className="block text-sm text-white/70 mb-1">Document type</span>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-sm text-white/70 mb-1">File</span>
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files[0])} required />
        </label>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={busy || !file} className="btn-primary w-full">
          {busy ? "Submitting…" : "Submit for Review"}
        </button>
      </form>
    </main>
  );
}
