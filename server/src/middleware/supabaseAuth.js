import { createContextClient, createAdminClient, verifyCredentials } from "@supabase/server/core";

// We can export an admin client directly for background tasks or webhooks
export const supabaseAdmin = createAdminClient();

// This is an Express middleware that checks the user's JWT
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const apikey = req.headers.apikey || null;
    const token = authHeader ? authHeader.replace("Bearer ", "") : null;

    // Verify the credentials using the core primitive (this checks the token against Supabase)
    const { data: auth, error } = await verifyCredentials(
      { token, apikey },
      { auth: "user" } // We explicitly want to ensure it's a valid user JWT
    );

    if (error) {
      return res.status(error.status || 401).json({ message: error.message, error: error.message });
    }

    // Attach the user claims to the request so controllers can use them
    req.user = auth.userClaims;

    // Create a scoped Supabase client for this specific user request
    // This ensures all DB queries enforce Postgres Row Level Security (RLS)
    req.supabase = createContextClient({
      auth: { token: auth.token, keyName: auth.keyName }
    });

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ message: "Internal server error during authentication" });
  }
};

// Role-based access control middleware
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const userRole = req.user.user_metadata?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: `Access denied. Requires one of: ${allowedRoles.join(', ')}` });
    }
    next();
  };
};
