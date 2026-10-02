import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-850 mt-20 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="FRETO" className="h-8 w-8 rounded-lg object-contain" />
              <div>
                <span className="text-xl font-black text-white tracking-tight leading-none block">
                  FRE<span className="text-orange-500">TO</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Freight made simpler
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              India's transparent freight & verified truck booking network. Connecting cargo shippers
              directly with verified fleet owners, transparent competitive bidding, and live telemetry tracking.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Freight Solutions
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/loads/new" className="hover:text-orange-400 transition-colors">
                  Post Freight & Book Truck
                </Link>
              </li>
              <li>
                <Link to="/loads/browse" className="hover:text-orange-400 transition-colors">
                  Freight Loads Marketplace
                </Link>
              </li>
              <li>
                <Link to="/fleet" className="hover:text-orange-400 transition-colors">
                  Verified Fleet Network
                </Link>
              </li>
              <li>
                <Link to="/tracking" className="hover:text-orange-400 transition-colors">
                  Live GPS Route Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Fleet Categories */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Fleet Types Available
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Mini Truck / Tata Ace (1-2 Ton)</li>
              <li>• 14ft Open Body (3-4 Ton)</li>
              <li>• 19ft Container (7-8 Ton)</li>
              <li>• 24ft & 32ft Multi-Axle (10-20 Ton)</li>
              <li>• Temperature-Controlled Refrigerated</li>
              <li>• Heavy Machinery Flatbed Trailers</li>
            </ul>
          </div>

          {/* Trust & Support */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Enterprise Trust & Security
            </h4>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <span>🛡️</span>
                <span>100% Verified Fleet Transporters</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span>📄</span>
                <span>GST Tax Invoices (SAC 996511)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span>📍</span>
                <span>Real-Time Satellite GPS Fix</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span>⚡</span>
                <span>24/7 Transit Support Hub</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-500">
          <div className="space-y-2">
            <p className="font-semibold text-slate-400">FRETO Logistics Private Limited</p>
            <p>123 Freight Avenue, Transport Hub</p>
            <p>Mumbai, Maharashtra 400001, India</p>
            <p>Email: support@freto.com | Phone: +91 98765 43210</p>
          </div>
          <div className="flex flex-col md:items-end justify-between">
            <div className="flex flex-wrap gap-4 mb-4 md:mb-0">
              <Link to="/legal/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link to="/legal/terms" className="hover:text-slate-400 transition-colors">Terms of Carriage</Link>
              <span>•</span>
              <Link to="/legal/cookies" className="hover:text-slate-400 transition-colors">Cookie Policy</Link>
              <span>•</span>
              <Link to="/legal/refunds" className="hover:text-slate-400 transition-colors">Refunds & Cancellations</Link>
            </div>
            <p>© {new Date().getFullYear()} FRETO Logistics Network. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
