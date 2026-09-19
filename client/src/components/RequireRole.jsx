import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Wrap a <Route element> with <RequireRole roles={["SHIPPER"]}>...</RequireRole>.
 * This is a UX convenience only — every route it guards is also enforced
 * server-side by requireRole() in the API, which is the real boundary.
 */
export default function RequireRole({ roles, children }) {
  const { user, ready } = useAuth();

  if (!ready) return null; // avoid a flash-redirect while we check localStorage
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <p className="text-white/70">
          Your account ({user.role.toLowerCase()}) doesn't have access to this page.
        </p>
      </main>
    );
  }
  return children;
}
