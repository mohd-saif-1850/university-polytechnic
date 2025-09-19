import app from "../src/app.js";
import dbConnect from "../src/db/index.js";

// ensure DB connection before handling requests
let isDbConnected = false;

export default async function handler(req, res) {
  if (!isDbConnected) {
    try {
      await dbConnect();
      isDbConnected = true;
    } catch (err) {
      console.error("❌ DB connection failed:", err.message);
      return res.status(500).json({ error: "Database connection failed" });
    }
  }

  return app(req, res); // let Express handle the request
}
