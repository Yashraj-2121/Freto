import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("freto_cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("freto_cookie_consent", "accepted");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex justify-center md:justify-start">
        <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-xl p-4 md:p-6 w-full md:max-w-lg pointer-events-auto flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-sm text-slate-300 text-center sm:text-left leading-relaxed">
            We use essential cookies to ensure secure authentication and keep you logged in. 
            By continuing to use this site, you accept our use of cookies as detailed in our{" "}
            <Link to="/legal/cookies" className="text-orange-500 hover:text-orange-400 font-medium underline underline-offset-2">
              Cookie Policy
            </Link>.
          </div>
          <button
            onClick={handleAccept}
            className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg shadow-lg shadow-orange-500/20 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            I Accept
          </button>
        </div>
      </div>
    </div>
  );
}
