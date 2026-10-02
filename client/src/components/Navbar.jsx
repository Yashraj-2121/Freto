import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Role-specific navigation links
  const getNavLinks = () => {
    if (!user) {
      return [
        { to: "/", label: "Home" },
        { to: "/loads/browse", label: "Freight Marketplace" },
        { to: "/fleet", label: "Fleet Catalog" },
        { to: "/tracking", label: "Live Tracking" },
      ];
    }

    if (user.role === "SHIPPER") {
      return [
        { to: "/", label: "Home" },
        { to: "/loads/new", label: "Book a Truck" },
        { to: "/loads/mine", label: "My Loads & Quotes" },
        { to: "/bookings", label: "Bookings & Invoices" },
        { to: "/tracking", label: "Live GPS Tracking" },
      ];
    }

    if (user.role === "TRANSPORTER") {
      return [
        { to: "/", label: "Home" },
        { to: "/loads/browse", label: "Freight Marketplace" },
        { to: "/fleet", label: "My Fleet" },
        { to: "/bookings", label: "Active Bookings" },
        { to: "/tracking", label: "Live GPS Tracking" },
      ];
    }

    if (user.role === "DRIVER") {
      return [
        { to: "/", label: "Home" },
        { to: "/loads/browse", label: "Load Board" },
        { to: "/fleet", label: "My Truck" },
        { to: "/tracking", label: "Live GPS Navigation" },
      ];
    }

    // Default fallback
    return [
      { to: "/", label: "Home" },
      { to: "/tracking", label: "Live Tracking" },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-50 bg-[#0B1522]/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo with uploaded FRETO icon and tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="FRETO Logo"
              className="h-11 w-11 rounded-xl object-contain shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center leading-none">
                FRE<span className="text-orange-500">TO</span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide mt-1">
                Freight made simpler
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links - strictly filtered by user role */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(link.to)
                    ? "text-orange-400 bg-orange-500/10 shadow-sm shadow-orange-500/10"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Profile & Auth CTA */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-bold text-white truncate max-w-[150px]">
                    {user.name || "Logged In User"}
                  </div>
                  <span className="badge bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] mt-0.5">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/login" className="btn-secondary text-xs py-2 px-4">
                  Sign In
                </Link>
                <Link to="/loads/new" className="btn-primary text-xs py-2 px-4">
                  Book a Truck
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-5 space-y-1.5 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2 rounded-lg text-sm font-medium ${
                isActive(link.to)
                  ? "text-orange-400 bg-orange-500/10 font-bold"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 border-t border-slate-800 mt-2">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{user.name}</div>
                  <span className="badge bg-orange-500/20 text-orange-400 text-[10px]">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate("/");
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 bg-slate-800"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary text-xs flex-1 text-center py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/loads/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary text-xs flex-1 text-center py-2"
                >
                  Book a Truck
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
