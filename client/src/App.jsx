import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import BookTruckPage from "./pages/BookTruckPage.jsx";
import BrowseLoadsPage from "./pages/BrowseLoadsPage.jsx";
import MyLoadsPage from "./pages/MyLoadsPage.jsx";
import FleetPage from "./pages/FleetPage.jsx";
import MyBookingsPage from "./pages/MyBookingsPage.jsx";
import TripTrackingPage from "./pages/TripTrackingPage.jsx";
import LegalPage from "./pages/LegalPage.jsx";
import CookieBanner from "./components/CookieBanner.jsx";

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#0B1522] text-slate-100">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/loads/new" element={<BookTruckPage />} />
            <Route path="/loads/browse" element={<BrowseLoadsPage />} />
            <Route path="/loads/mine" element={<MyLoadsPage />} />
            <Route path="/fleet" element={<FleetPage />} />
            <Route path="/bookings" element={<MyBookingsPage />} />
            <Route path="/tracking" element={<TripTrackingPage />} />
            <Route path="/tracking/:tripId" element={<TripTrackingPage />} />
            <Route path="/legal/:policyType" element={<LegalPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <CookieBanner />
        <Footer />
      </div>
    </AuthProvider>
  );
}
