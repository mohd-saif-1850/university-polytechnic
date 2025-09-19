// backend/src/app.js
import express from "express";
import cors from "cors";

const app = express();

// Middlewares
app.use(express.json());

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "https://university-polytechnic-w6k1-f1gcyim6p-msking1850s-projects.vercel.app",
  "http://localhost:5173"
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,   // 👈 simpler: cors will handle array check
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Polytechnic Store Backend is running!");
});

// Routes
import itemRouter from "./routes/item.route.js";
import formRouter from "./routes/form.route.js";
import consumedRouter from "./routes/consumed.route.js";

app.use("/api/v1/items", itemRouter);
app.use("/api/v1/forms", formRouter);
app.use("/api/v1", consumedRouter);

export default app;
