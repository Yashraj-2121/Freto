import mongoose from "mongoose";

export async function connectDB() {
  const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/freto_freight";
  try {
    const conn = await mongoose.connect(mongoUrl);
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error("Tip: Ensure MongoDB is running (e.g. via Docker: docker start freto-mongo or local mongod)");
    throw error;
  }
}
