import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get("/", (req, res) => res.send("API is running"));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
});