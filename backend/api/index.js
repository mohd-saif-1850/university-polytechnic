// backend/api/index.js
import app from "../app.js";
import { connectDB } from "../db.js";

// connect to MongoDB (initiate connection once)
await connectDB();

// export Express app as default — Vercel turns this into a serverless handler
export default app;
