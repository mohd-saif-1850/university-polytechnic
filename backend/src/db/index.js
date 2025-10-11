import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

async function dbConnect() {
  if (isConnected) {
    console.log("Database is already connected ");
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env");
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "polytechnic",
      bufferCommands: false,
    });

    isConnected = db.connections[0].readyState === 1;
    if (isConnected) console.log(" DB connected successfully");
  } catch (error) {
    console.error(" DB connection failed:", error);
    throw new Error("Database connection failed");
  }
}

export default dbConnect;
