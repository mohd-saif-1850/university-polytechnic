import express from "express";
import cors from "cors";

const app = express();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Polytechnic Store Backend is running!");
});

// Routes
import itemRoute from "./routes/item.route.js";
import formRoute from "./routes/form.route.js";
import consumedRoute from "./routes/consumed.route.js";

// Base path
app.use("/api/v1/items", itemRoute);
app.use("/api/v1/forms", formRoute);
app.use("/api/v1", consumedRoute);

export default app;
