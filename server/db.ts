import mongoose from "mongoose";

let isConnecting = false;
let isConnected = false;

export async function connectDB() {
  // If already connected or connecting, skip
  if (isConnected || isConnecting) {
    console.log("[DB] Already connected or connecting, skipping...");
    return;
  }

  try {
    isConnecting = true;
    const mongoUri = "mongodb://localhost:27017/Dental_Clinic";
    console.log("[DB] Attempting to connect to MongoDB...");
    await mongoose.connect(mongoUri);
    isConnected = true;
    isConnecting = false;
    console.log("[DB] MongoDB connected successfully");
  } catch (error) {
    isConnecting = false;
    console.error("[DB] MongoDB connection error:", error);
    throw error;
  }
}

export function disconnectDB() {
  if (isConnected) {
    mongoose.disconnect();
    isConnected = false;
    console.log("[DB] Disconnected from MongoDB");
  }
}
