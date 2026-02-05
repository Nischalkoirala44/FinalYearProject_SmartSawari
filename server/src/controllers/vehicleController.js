// src/controller/vehicleController.js

const Vehicle = require("../models/Vehicle");
const Notification = require("../models/Notification");

// Fetch all approved vehicles for landing page
exports.getApprovedVehicles = async (req, res) => {
  try {
    const approvedVehicles = await Vehicle.findAll({
      where: { status: "approved", availabilityStatus: "available" },
      attributes: [
        "id",
        "registrationNumber",
        "vehicleType",
        "vehicleCondition",
        "pricePerDay",
        "documentImage",
        "status",
        "created_at",
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: approvedVehicles.length,
      vehicles: approvedVehicles,
    });
  } catch (error) {
    console.error("Error fetching approved vehicles:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getApprovedVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const vehicle = await Vehicle.findOne({
      where: {
        id,
        status: "approved",
        userId,
      },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found, not approved, or you do not own it",
      });
    }

    res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getRejectedVehicles = async (req, res) => {
  try {
    const userId = req.user.id;
    const rejectedVehicles = await Vehicle.findAll({
      where: { status: "rejected" },
      attributes: [
        "id",
        "registrationNumber",
        "vehicleType",
        "vehicleCondition",
        "pricePerDay",
        "documentImage",
        "status",
        "created_at",
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: rejectedVehicles.length,
      vehicles: rejectedVehicles,
    });
  } catch (error) {
    console.error("Error fetching rejected vehicles:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.params.userId },
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
