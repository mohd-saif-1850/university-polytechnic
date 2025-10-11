import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import dbConnect from "./db/index.js"; 

const PORT = process.env.PORT || 5000;

dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" MongoDB connection failed:", err.message);
  });
