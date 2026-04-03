// server.js
const http = require("http");
const { Server } = require("socket.io");
const chatRoutes = require("./src/routes/chatRoute");
const { saveMessageInternal } = require("./src/controllers/chatController");

const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const axios = require('axios');

const path = require("path");
const cookieParser = require("cookie-parser");
require("./src/utils/cronJobs");

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
const notificationRoute = require("./src/routes/notificationRoute");
const adminRoute = require("./src/routes/adminRoute");


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

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", credentials: true }
});

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
app.use("/api/notifications", notificationRoute);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoute);

io.on("connection", (socket) => {
  socket.on("join_chat", ({ chatId }) => {
    socket.join(chatId);
  });

  socket.on("send_message", async (data) => {
    const { chatId, senderId, text, senderName } = data;
    const saved = await saveMessageInternal(chatId, senderId, text);
    if (saved) {
      io.to(chatId).emit("receive_message", { ...saved, sender_name: senderName });
    }
  });
});

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
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
