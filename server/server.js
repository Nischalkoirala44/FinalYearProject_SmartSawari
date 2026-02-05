// server.js
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");

const path = require("path");
const cookieParser = require("cookie-parser");

// Database
const client = require("./src/config/db");

// Routes
const userRoutes = require("./src/routes/userRoute");
const authRoutes = require("./src/routes/authRoute");
const verificationRoutes = require("./src/routes/verificationRoute");
const vehicleRoutes = require("./src/routes/vehicleRoutes");


const PORT = process.env.PORT || 3001;
const app = express();

// Enable CORS for frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Parse JSON & URL-encoded requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/", async (req, res) => {
  try {
    const result = await client.query("SELECT NOW()");
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/verifications", verificationRoutes);
app.use("/api/vehicles", vehicleRoutes);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
