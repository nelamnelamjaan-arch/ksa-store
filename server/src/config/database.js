import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * @returns {Promise<boolean>} true if connected
 */
export async function connectDb() {
  if (!MONGODB_URI) {
    console.warn("MONGODB_URI not set — API routes that need MongoDB will fail.");
    return false;
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB connected");
  return true;
}
