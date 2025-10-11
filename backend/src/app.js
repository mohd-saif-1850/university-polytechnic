import express from "express";
import cors from "cors";

const app = express();

// Middlewares
app.use(express.json());

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "http://localhost:5173"
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
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
import firmRouter from "./routes/firm.route.js";

app.use("/api/v2/items", itemRouter);
app.use("/api/v2/firms", firmRouter);

export default app;
