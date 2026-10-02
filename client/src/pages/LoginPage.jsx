import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("SHIPPER");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();
  const { setAuthSession, quickDemoLogin } = useAuth();

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuthSession(data.token, data.user);
      if (data.user.role === "SHIPPER") navigate("/loads/new");
      else if (data.user.role === "TRANSPORTER") navigate("/loads/browse");
      else if (data.user.role === "DRIVER") navigate("/tracking");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/auth/otp/send", { email });
      setOtpSent(true);
      setError(data.message); // Temporarily show success message in error box (or add a success state)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/auth/otp/verify", { email, otp });
      setAuthSession(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
        phone,
        role,
        companyName,
      });
      setAuthSession(data.token, data.user);
      if (role === "SHIPPER") navigate("/loads/new");
      else if (role === "TRANSPORTER") navigate("/loads/browse");
      else navigate("/tracking");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickSelect(selectedRole) {
    setLoading(true);
    setError(null);
    try {
      await quickDemoLogin(selectedRole);
      if (selectedRole === "SHIPPER") navigate("/loads/new");
      else if (selectedRole === "TRANSPORTER") navigate("/loads/browse");
      else if (selectedRole === "DRIVER") navigate("/tracking");
      else navigate("/");
    } catch (err) {
      setError("Failed to sign in to demo account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card max-w-md w-full p-8 border-slate-800 space-y-6">
        {/* Header with FRETO logo and tagline */}
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="FRETO Logo"
            className="h-12 w-12 rounded-xl object-contain mx-auto shadow-lg shadow-orange-500/20"
          />
          <h2 className="text-2xl font-black text-white tracking-tight">
            Sign in to FRE<span className="text-orange-500">TO</span>
          </h2>
          <p className="text-xs text-slate-400">
            Access your shipments, competitive quotes, and live GPS telemetry
          </p>
        </div>

        {/* Quick Portal Switcher */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              ⚡ Quick Account Access
            </span>
            <span className="text-[10px] text-orange-400 font-medium">Select Role</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSelect("SHIPPER")}
              disabled={loading}
              className="p-2.5 rounded-lg text-xs font-semibold bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/20 transition-all text-center"
            >
              <div className="text-base mb-0.5">📦</div>
              <div>Shipper</div>
              <div className="text-[10px] text-slate-400 font-normal">Post & Book</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect("TRANSPORTER")}
              disabled={loading}
              className="p-2.5 rounded-lg text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 transition-all text-center"
            >
              <div className="text-base mb-0.5">🚚</div>
              <div>Transporter</div>
              <div className="text-[10px] text-slate-400 font-normal">Fleet & Bids</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect("DRIVER")}
              disabled={loading}
              className="p-2.5 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-all text-center"
            >
              <div className="text-base mb-0.5">👨🏽‍✈️</div>
              <div>Driver</div>
              <div className="text-[10px] text-slate-400 font-normal">Live GPS</div>
            </button>
          </div>
        </div>

        {/* Tab switch between Login & Register */}
        <div className="flex border-b border-slate-800 text-[11px] sm:text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setTab("login"); setOtpSent(false); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              tab === "login"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => { setTab("otp"); setOtpSent(false); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              tab === "otp"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Email OTP
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              tab === "register"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Login Form */}
        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="shipper@freto.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Signing in..." : "Sign In to FRETO"}
            </button>
          </form>
        ) : tab === "otp" ? (
          /* OTP Form */
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">We will send a 6-digit OTP to this email.</p>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? "Sending OTP..." : "Send Email OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    className="input text-center text-xl tracking-[0.5em] font-mono placeholder:tracking-normal"
                    placeholder="------"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20">
                  {loading ? "Verifying..." : "Verify & Log In"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setOtpSent(false)} 
                  className="w-full text-xs text-slate-400 hover:text-white py-2"
                >
                  ← Use a different email
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                className="input"
                placeholder="Sunil Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                className="input"
                placeholder="sunil@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mobile No.</label>
                <input
                  type="text"
                  className="input"
                  placeholder="9820011223"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">I am a</label>
                <select
                  className="input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="SHIPPER">Shipper (Cargo Owner)</option>
                  <option value="TRANSPORTER">Transporter (Fleet Owner)</option>
                  <option value="DRIVER">Truck Driver</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Company / Organization</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Apex Cargo & Freight"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-start gap-2 pt-1 pb-2">
              <input 
                type="checkbox" 
                id="consent" 
                required 
                className="mt-1 accent-orange-500 rounded border-slate-700 bg-slate-900 cursor-pointer" 
              />
              <label htmlFor="consent" className="text-xs text-slate-400 leading-tight">
                I agree to the FRETO <a href="/legal/terms" target="_blank" rel="noreferrer" className="text-orange-500 hover:underline">Terms & Conditions</a>, <a href="/legal/privacy" target="_blank" rel="noreferrer" className="text-orange-500 hover:underline">Privacy Policy</a>, and consent to the collection of my personal and location data as described.
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Creating Account..." : "Complete Registration"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
