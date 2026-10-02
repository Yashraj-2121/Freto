import { supabasePublic } from "../config/supabase.js";

export async function register(req, res) {
  try {
    const { name, email, password, phone, role, companyName, city } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Name, email, password, and phone are required." });
    }

    // Register user directly into Supabase Auth
    const { data, error } = await supabasePublic.auth.signUp({
      email: email.toLowerCase(),
      password: password,
      options: {
        data: {
          name,
          phone,
          role: role || "SHIPPER",
          companyName: companyName || "",
          city: city || "Mumbai",
        }
      }
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // If email confirmations are enabled in Supabase, the user won't get a session yet.
    // (You can disable "Confirm Email" in Supabase Auth -> Providers -> Email if you want instant login)
    const token = data.session?.access_token;
    if (!token) {
       return res.status(201).json({ message: "Registration successful. Please check your email to confirm!" });
    }

    // Return exact format the frontend expects
    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: data.user.id,
        name: data.user.user_metadata.name,
        email: data.user.email,
        role: data.user.user_metadata.role,
        companyName: data.user.user_metadata.companyName,
        phone: data.user.user_metadata.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user", error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Login via Supabase Auth
    const { data, error } = await supabasePublic.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = data.session.access_token;
    
    res.json({
      message: "Login successful",
      token,
      user: {
        id: data.user.id,
        name: data.user.user_metadata.name,
        email: data.user.email,
        role: data.user.user_metadata.role,
        companyName: data.user.user_metadata.companyName,
        phone: data.user.user_metadata.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to log in", error: error.message });
  }
}

export async function demoLogin(req, res) {
  res.status(501).json({ message: "Demo Login currently disabled while migrating to Supabase Auth." });
}

export async function getMe(req, res) {
  try {
    // req.user is set by our requireAuth middleware which decodes the Supabase JWT
    const u = req.user;
    res.json({
      user: {
        id: u.sub,
        email: u.email,
        role: u.user_metadata?.role,
        name: u.user_metadata?.name,
        companyName: u.user_metadata?.companyName,
        phone: u.user_metadata?.phone,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
}
