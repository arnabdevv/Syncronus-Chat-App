import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";
import messagesRoutes from "./routes/MessagesRoutes.js";
import { initSocket } from "./socket/index.js";
import dns from "dns";

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// CORS middleware configuration
app.use(
  cors({
    origin: process.env.ORIGIN, // Your frontend's origin (e.g., http://localhost:5173)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true, // Allow cookies to be sent along with requests
  }),
);

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

// Middleware for parsing cookies and JSON bodies
app.use(cookieParser());
app.use(express.json());
// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime(), timestamp: new Date() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);

// Start the HTTP server
const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Attach Socket.io to the same HTTP server
initSocket(server);

// Connect to MongoDB
mongoose
  .connect(databaseURL)
  .then(() => console.log("DB Connect Successful"))
  .catch((err) => console.log(err.message));
