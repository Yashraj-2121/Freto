import mongoose from "mongoose";

// High-volume, write-heavy, semi-structured data: GPS tracking pings
// (geospatial-indexed) and the system audit log. Schema-flexible and
// horizontally scalable independent of the relational core.
export async function connectMongo() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("MongoDB connected");
}
