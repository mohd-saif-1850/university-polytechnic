// backend/app.js
import express from "express";
import cors from "cors";

const app = express();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: [process.env.CORS_ORIGIN,"https://university-polytechnic-w6k1.vercel.app"],
    credentials: true,
  })
);

// Root route for sanity check at /api
app.get("/", (req, res) => {
  res.send("🚀 Polytechnic Store Backend is running!");
});

// Import your routes (keep your existing route files)
import itemRoute from "./routes/item.route.js";
import formRoute from "./routes/form.route.js";
import consumedRoute from "./routes/consumed.route.js";

// Base path
app.use("/api/v1/items", itemRoute);
app.use("/api/v1/forms", formRoute);
app.use("/api/v1", consumedRoute);

export default app;
