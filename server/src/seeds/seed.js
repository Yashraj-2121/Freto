import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

import { User } from "../models/User.js";
import { Truck } from "../models/Truck.js";
import { Load } from "../models/Load.js";
import { Bid } from "../models/Bid.js";
import { Booking } from "../models/Booking.js";
import { Trip } from "../models/Trip.js";

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/freto_freight";

export async function seedDatabase() {
  console.log("🌱 Connecting to MongoDB for seeding...");
  await mongoose.connect(MONGO_URL);
  console.log("✅ Connected to MongoDB.");

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Truck.deleteMany({}),
    Load.deleteMany({}),
    Bid.deleteMany({}),
    Booking.deleteMany({}),
    Trip.deleteMany({}),
  ]);
  console.log("🧹 Cleaned existing database collections.");

  const defaultPassword = await bcrypt.hash("freto123", 10);

  // 1. Create Users
  const shipper = await User.create({
    name: "Sunil Sharma",
    email: "shipper@freto.in",
    password: defaultPassword,
    phone: "9820111222",
    role: "SHIPPER",
    companyName: "Prime Cargo Logistics Ltd",
    city: "Mumbai",
  });

  const transporter = await User.create({
    name: "Gurdeep Singh",
    email: "transporter@freto.in",
    password: defaultPassword,
    phone: "9810333444",
    role: "TRANSPORTER",
    companyName: "Punjab Roadways Fleet & Logistics",
    city: "Delhi",
  });

  const driver = await User.create({
    name: "Ramesh Kumar",
    email: "driver@freto.in",
    password: defaultPassword,
    phone: "9876543210",
    role: "DRIVER",
    companyName: "Punjab Roadways Fleet & Logistics",
    city: "Mumbai",
  });

  const admin = await User.create({
    name: "Platform Administrator",
    email: "admin@freto.in",
    password: defaultPassword,
    phone: "9900000000",
    role: "ADMIN",
    companyName: "FRETO Freight Portal",
    city: "Delhi",
  });

  console.log("👤 Created 4 default users (Shipper, Transporter, Driver, Admin).");

  // 2. Create Fleet Trucks
  const trucks = await Truck.create([
    {
      transporterId: transporter._id,
      truckNumber: "MH-04-AB-1234",
      truckType: "14ft Open Body (3-4 Ton)",
      capacityTons: 4,
      baseRatePerKm: 34,
      driverName: "Ramesh Kumar",
      driverPhone: "+91 98765 43210",
      currentCity: "Mumbai",
      status: "On Trip",
    },
    {
      transporterId: transporter._id,
      truckNumber: "DL-01-EF-9012",
      truckType: "19ft Container (7-8 Ton)",
      capacityTons: 7.5,
      baseRatePerKm: 46,
      driverName: "Balwinder Singh",
      driverPhone: "+91 98112 23344",
      currentCity: "Delhi",
      status: "Available",
    },
    {
      transporterId: transporter._id,
      truckNumber: "MH-12-CD-5678",
      truckType: "Mini Truck / Tata Ace (1-2 Ton)",
      capacityTons: 1.5,
      baseRatePerKm: 22,
      driverName: "Santosh Shinde",
      driverPhone: "+91 97654 32109",
      currentCity: "Pune",
      status: "Available",
    },
    {
      transporterId: transporter._id,
      truckNumber: "KA-05-GH-3456",
      truckType: "24ft Multi-Axle (10-12 Ton)",
      capacityTons: 12,
      baseRatePerKm: 58,
      driverName: "Suresh Patil",
      driverPhone: "+91 94480 12345",
      currentCity: "Bengaluru",
      status: "Available",
    },
    {
      transporterId: transporter._id,
      truckNumber: "TN-02-JK-7890",
      truckType: "32ft Multi-Axle (15-20 Ton)",
      capacityTons: 18,
      baseRatePerKm: 72,
      driverName: "Murugan R",
      driverPhone: "+91 98401 56789",
      currentCity: "Chennai",
      status: "Available",
    },
    {
      transporterId: transporter._id,
      truckNumber: "GJ-01-LM-2345",
      truckType: "Refrigerated Container (5-10 Ton)",
      capacityTons: 8,
      baseRatePerKm: 65,
      driverName: "Hardik Patel",
      driverPhone: "+91 98250 67890",
      currentCity: "Ahmedabad",
      status: "Available",
    },
  ]);
  console.log(`🚛 Created ${trucks.length} verified fleet trucks.`);

  // 3. Create Sample Loads
  const loadActive = await Load.create({
    shipperId: shipper._id,
    title: "400 Cartons of FMCG & Packaged Foods Consignment",
    originCity: "Mumbai",
    originAddress: "Bhiwandi Warehousing Hub, Sector 4, Mumbai",
    destinationCity: "Delhi",
    destinationAddress: "Okhla Industrial Area Phase-III, New Delhi",
    distanceKm: 1420,
    cargoType: "FMCG & Consumer Goods",
    weightTons: 3.8,
    truckTypeNeeded: "14ft Open Body (3-4 Ton)",
    budget: 48000,
    pickupDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    notes: "Requires waterproof tarpaulin cover. Fragile biscuits and dry beverages.",
    status: "BOOKED",
  });

  const loadOpen1 = await Load.create({
    shipperId: shipper._id,
    title: "Automotive Gearboxes & Spare Parts Consignment",
    originCity: "Pune",
    originAddress: "Chakan Industrial Corridor, Pune",
    destinationCity: "Bengaluru",
    destinationAddress: "Peenya Industrial Area Stage-II, Bengaluru",
    distanceKm: 840,
    cargoType: "Industrial Machinery & Parts",
    weightTons: 7.2,
    truckTypeNeeded: "19ft Container (7-8 Ton)",
    budget: 39000,
    pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    notes: "Palletized cargo with forklift loading assistance provided at origin.",
    status: "BIDDING",
  });

  const loadOpen2 = await Load.create({
    shipperId: shipper._id,
    title: "Organic Cotton Textiles & Export Garments",
    originCity: "Ahmedabad",
    originAddress: "Narol Textile Park, Ahmedabad",
    destinationCity: "Mumbai",
    destinationAddress: "Nhava Sheva Port Terminal Gate 3, Navi Mumbai",
    distanceKm: 525,
    cargoType: "Textiles & Garments",
    weightTons: 1.8,
    truckTypeNeeded: "Mini Truck / Tata Ace (1-2 Ton)",
    budget: 18500,
    pickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    notes: "Export customs clearing documents attached. Dry weather transit only.",
    status: "POSTED",
  });

  const loadOpen3 = await Load.create({
    shipperId: shipper._id,
    title: "Structural Steel Bars & Heavy Angle Channels",
    originCity: "Delhi",
    originAddress: "Faridabad Heavy Engineering Hub, NCR",
    destinationCity: "Jaipur",
    destinationAddress: "VKI Industrial Area, Jaipur",
    distanceKm: 280,
    cargoType: "Construction & Steel Materials",
    weightTons: 15.0,
    truckTypeNeeded: "32ft Multi-Axle (15-20 Ton)",
    budget: 28000,
    pickupDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    notes: "Crane unloading required at site. Full insurance coverage active.",
    status: "POSTED",
  });

  console.log("📦 Created 4 realistic freight loads.");

  // 4. Create Bids
  const bidAccepted = await Bid.create({
    loadId: loadActive._id,
    transporterId: transporter._id,
    truckId: trucks[0]._id, // MH-04-AB-1234
    bidAmount: 46500,
    status: "ACCEPTED",
    message: "Truck MH-04-AB-1234 available right now in Bhiwandi. Driver Ramesh Kumar assigned.",
    estimatedDeliveryHours: 36,
  });

  await Bid.create({
    loadId: loadOpen1._id,
    transporterId: transporter._id,
    truckId: trucks[1]._id, // DL-01-EF-9012
    bidAmount: 37500,
    status: "PENDING",
    message: "Weather-sealed container truck ready for Pune to Bengaluru route.",
    estimatedDeliveryHours: 20,
  });

  console.log("🏷️ Created transporter bids.");

  // 5. Create Confirmed Booking
  const booking = await Booking.create({
    bookingReference: "BK-MUM-892104",
    loadId: loadActive._id,
    bidId: bidAccepted._id,
    shipperId: shipper._id,
    transporterId: transporter._id,
    truckId: trucks[0]._id,
    finalFare: 46500,
    gstAmount: 2325,
    totalAmount: 48825,
    status: "IN_TRANSIT",
    paymentStatus: "PAID",
    paymentMethod: "NetBanking / UPI (Simulated)",
    invoiceNumber: "INV-2026-892104",
  });

  console.log("📄 Created verified booking with tax invoice.");

  // 6. Create Active Trip with real Live Coordinates (Between Mumbai and Delhi)
  // Approx waypoint near Surat/Vadodara (Highway NH48)
  const trip = await Trip.create({
    bookingId: booking._id,
    truckId: trucks[0]._id,
    driverName: "Ramesh Kumar",
    driverPhone: "+91 98765 43210",
    originCity: "Mumbai",
    destinationCity: "Delhi",
    originCoordinates: { lat: 19.076, lng: 72.8777 },
    destinationCoordinates: { lat: 28.6139, lng: 77.209 },
    currentCoordinates: { lat: 22.3072, lng: 73.1812 }, // Vadodara on NH48!
    progressPercent: 35,
    speedKmH: 58,
    status: "IN_TRANSIT",
    estimatedArrival: "Tomorrow, 6:00 AM",
    routeHistory: [
      {
        lat: 19.076,
        lng: 72.8777,
        timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000),
        statusNote: "Dispatched from Bhiwandi Central Hub, Mumbai",
      },
      {
        lat: 20.3893,
        lng: 72.9106,
        timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000),
        statusNote: "Crossed Vapi Toll Plaza - Traffic Smooth",
      },
      {
        lat: 21.1702,
        lng: 72.8311,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        statusNote: "Driver Rest Stop & Fuel at Surat Bypass",
      },
      {
        lat: 22.3072,
        lng: 73.1812,
        timestamp: new Date(),
        statusNote: "Cruising on NH48 Vadodara Expressway at 58 km/h",
      },
    ],
  });

  console.log("🗺️ Created active live-tracking trip between Mumbai & Delhi.");
  console.log("🎉 Database Seeding Completed Successfully!");
  console.log(`Trip Tracking ID for Demo: ${trip._id}`);
}

// Execute standalone if called directly
if (process.argv[1]?.endsWith("seed.js")) {
  seedDatabase()
    .then(() => {
      console.log("Done. Exiting process.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}
