const { getApprovedVehicles, getApprovedVehicleById, getPublicVehicleById, getNotifications, getRejectedVehicles } = require("../controllers/vehicleController");
const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/verifyRole");

// GET all approved vehicles
router.get("/approved", getApprovedVehicles);

// Get rejected vehicles for the authenticated user
router.get("/rejected",
    authenticateUser,
    getRejectedVehicles
);

// GET approved vehicle by ID
router.get("/approved/:id", getApprovedVehicleById);

// GET public vehicle by ID (no authentication required)
router.get("/public/:id", getPublicVehicleById);

// GET notifications for vehicle owners
router.get("/notifications", 
    authenticateUser, 
    verifyRole(["owner"]),
    getNotifications);

module.exports = router;



