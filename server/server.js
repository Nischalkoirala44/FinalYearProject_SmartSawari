// server.js
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const axios = require('axios');

const path = require("path");
const cookieParser = require("cookie-parser");

// Database
const client = require("./src/config/db");

// Routes
const userRoutes = require("./src/routes/userRoute");
const authRoutes = require("./src/routes/authRoute");
const verificationRoutes = require("./src/routes/verificationRoute");
const vehicleRoutes = require("./src/routes/vehicleRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const withdrawalRoute = require("./src/routes/withdrawalRoute");
const locationRoute = require("./src/routes/locationRoute");


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
app.use("/api/bookings", bookingRoutes);
app.use("/api/withdrawals", withdrawalRoute);
app.use("/api/locations", locationRoute);

app.get('/api/proxy/geocode', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
            {
                headers: {
                    'User-Agent': 'SmartSawariApp/1.0'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch address' });
    }
});


// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
