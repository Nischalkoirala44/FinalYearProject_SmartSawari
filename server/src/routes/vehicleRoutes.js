const {
  getApprovedVehicles,
  getApprovedVehicleById,
  getPublicVehicleById,
  getRejectedVehicles,
  getVehicleById
} = require("../controllers/vehicleController");
const { getMyVehicles } = require("../controllers/vehicleController");
const { updateVehicle } = require("../controllers/vehicleController");
const { deleteVehicle } = require("../controllers/vehicleController")
const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/verifyRole");
const upload = require("../middleware/cloudinaryUpload");

// GET all approved vehicles
router.get("/approved", getApprovedVehicles);

// Get rejected vehicles for the authenticated user
router.get("/rejected", authenticateUser, getRejectedVehicles);

// GET approved vehicle by ID
router.get("/approved/:id", getApprovedVehicleById);

// GET public vehicle by ID (no authentication required)
router.get("/public/:id", getPublicVehicleById);

// GET my vehicles for the authenticated user
router.get(
  "/owner-vehicles",
  authenticateUser,
  //verifyRole(["owner"]),
  getMyVehicles,
);

router.get(
  "/owner-vehicles/:id",
  authenticateUser,
  //verifyRole(["owner"]),
  getVehicleById,
);

router.put(
  "/update/:id",
  authenticateUser,
  upload.fields([{ name: "vehicleImages", maxCount: 5 }]),
  updateVehicle,
);

router.delete(
  "/delete/:id",
  authenticateUser,
  deleteVehicle,
)

module.exports = router;
