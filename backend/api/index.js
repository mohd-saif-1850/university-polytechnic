import app from "../app.js";
import dbConnect from "../db/index.js";

await dbConnect();  // connect MongoDB

export default app;
