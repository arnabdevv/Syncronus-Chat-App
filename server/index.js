import 'dotenv/config';
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";
import messagesRoutes from "./routes/MessagesRoutes.js";
import { initSocket } from "./socket/index.js";
import dns from "dns";



const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// CORS middleware configuration
app.use(
  cors({
    origin: true, // Your frontend's origin (e.g., http://localhost:5173)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.set("trust proxy", 1);

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

// Middleware for parsing JSON bodies
app.use(express.json());
// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

// Health check route
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", uptime: process.uptime(), timestamp: new Date() });
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
