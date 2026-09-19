import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-freto-freight-key-2026";

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// 1-Click Demo Users configuration
export const DEMO_CREDENTIALS = {
  SHIPPER: {
    email: "shipper@freto.in",
    role: "SHIPPER",
    name: "Sunil Sharma (Prime Cargo Ltd)",
    phone: "9820111222",
    companyName: "Prime Cargo Logistics",
  },
  TRANSPORTER: {
    email: "transporter@freto.in",
    role: "TRANSPORTER",
    name: "Gurdeep Singh (Punjab Roadways Fleet)",
    phone: "9810333444",
    companyName: "Punjab Roadways Fleet",
  },
  DRIVER: {
    email: "driver@freto.in",
    role: "DRIVER",
    name: "Ramesh Kumar (Expert Truck Pilot)",
    phone: "9876543210",
    companyName: "Punjab Roadways Fleet",
  },
  ADMIN: {
    email: "admin@freto.in",
    role: "ADMIN",
    name: "Platform Administrator",
    phone: "9900000000",
    companyName: "FRETO Freight Portal",
  },
};

export async function register(req, res) {
  try {
    const { name, email, password, phone, role, companyName, city } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Name, email, password, and phone are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: role || "SHIPPER",
      companyName: companyName || "",
      city: city || "Mumbai",
    });

    const token = generateToken(user);
    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        phone: user.phone,
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

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user);
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to log in", error: error.message });
  }
}

// Instant 1-Click Demo Login for Teacher Presentation
export async function demoLogin(req, res) {
  try {
    const requestedRole = (req.body.role || "SHIPPER").toUpperCase();
    const demoData = DEMO_CREDENTIALS[requestedRole] || DEMO_CREDENTIALS.SHIPPER;

    let user = await User.findOne({ role: requestedRole });
    if (!user) {
      const hashedPassword = await bcrypt.hash("freto123", 10);
      user = await User.create({
        ...demoData,
        password: hashedPassword,
      });
    }

    const token = generateToken(user);
    res.json({
      message: `Demo logged in as ${user.role}`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Demo login failed", error: error.message });
  }
}

export async function getMe(req, res) {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
}
