import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

// CORS middleware configuration
app.use(
  cors({
    origin: process.env.ORIGIN, // Your frontend's origin (e.g., http://localhost:5173)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true, // Allow cookies to be sent along with requests
  })
);

app.use("/uploads/profiles", express.static("uploads/profiles"));

// Middleware for parsing cookies and JSON bodies
app.use(cookieParser());
app.use(express.json());
// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

// Routes
app.use("/api/auth", authRoutes);

// Start the server
const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Connect to MongoDB
mongoose
  .connect(databaseURL)
  .then(() => console.log("DB Connect Successful"))
  .catch((err) => console.log(err.message));
