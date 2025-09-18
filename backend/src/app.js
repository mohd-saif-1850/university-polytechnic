// backend/app.js
import express from "express";
import cors from "cors";

const app = express();

// Middlewares
app.use(express.json());

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "https://your-frontend.vercel.app",
  "http://localhost:5173"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-to-server or Postman
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
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
