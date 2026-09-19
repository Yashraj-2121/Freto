import mongoose from "mongoose";
import { User, Truck, Load, Bid, Booking, Trip } from "../models/index.js";

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/freto_freight";

async function viewDatabase() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("\n=======================================================");
    console.log(`📦 FRETO DATABASE VIEWER: ${mongoUrl}`);
    console.log("=======================================================\n");

    const userCount = await User.countDocuments();
    const truckCount = await Truck.countDocuments();
    const loadCount = await Load.countDocuments();
    const bidCount = await Bid.countDocuments();
    const bookingCount = await Booking.countDocuments();
    const tripCount = await Trip.countDocuments();

    console.log("📊 COLLECTIONS SUMMARY:");
    console.table([
      { Collection: "users", Count: userCount },
      { Collection: "trucks", Count: truckCount },
      { Collection: "loads", Count: loadCount },
      { Collection: "bids", Count: bidCount },
      { Collection: "bookings", Count: bookingCount },
      { Collection: "trips", Count: tripCount }
    ]);

    // Users
    console.log("\n👤 REGISTERED USERS (users):");
    const users = await User.find().select("name email role createdAt").lean();
    console.table(users.map(u => ({
      ID: u._id.toString().slice(-6),
      Name: u.name,
      Email: u.email,
      Role: u.role
    })));

    // Trucks
    console.log("\n🚚 REGISTERED TRUCKS (trucks):");
    const trucks = await Truck.find().select("truckNumber truckType capacityTons driverName status baseRatePerKm").lean();
    console.table(trucks.map(t => ({
      "Truck No": t.truckNumber,
      Type: t.truckType,
      Capacity: `${t.capacityTons} Ton`,
      Driver: t.driverName,
      Rate: `₹${t.baseRatePerKm}/km`,
      Status: t.status
    })));

    // Loads
    console.log("\n📦 FREIGHT LOADS (loads):");
    const loads = await Load.find().select("originCity destinationCity weightTons cargoType budget status").lean();
    console.table(loads.map(l => ({
      ID: l._id.toString().slice(-6),
      Route: `${l.originCity} ➔ ${l.destinationCity}`,
      Cargo: l.cargoType,
      Weight: `${l.weightTons} T`,
      Budget: `₹${l.budget.toLocaleString("en-IN")}`,
      Status: l.status
    })));

    // Bookings
    console.log("\n📄 CONFIRMED BOOKINGS & INVOICES (bookings):");
    const bookings = await Booking.find().select("bookingReference invoiceNumber totalAmount paymentStatus status").lean();
    console.table(bookings.map(b => ({
      "Booking Ref": b.bookingReference,
      "Invoice #": b.invoiceNumber,
      Total: `₹${(b.totalAmount || 0).toLocaleString("en-IN")}`,
      Payment: b.paymentStatus,
      Status: b.status
    })));

    console.log("\n💡 TIP: To inspect documents interactively with a visual GUI:");
    console.log("   Connect MongoDB Compass or VS Code MongoDB extension to: mongodb://localhost:27017\n");
  } catch (err) {
    console.error("Database connection error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

viewDatabase();
