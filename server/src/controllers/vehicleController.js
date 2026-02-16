const Notification = require("../models/Notification");
const Location = require("../models/Location");

const { Op } = require("sequelize");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");

exports.getApprovedVehicles = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Current date YYYY-MM-DD

    const vehicles = await Vehicle.findAll({
      where: { status: "approved" },
      include: [{
        model: Booking,
        as: 'bookings',
        required: false, // Left Outer Join
        where: {
          bookingStatus: 'confirmed',
          startDate: { [Op.lte]: today },
          endDate: { [Op.gte]: today }
        }
      },
      {
          model: Location,
          as: 'location', // Ensure this matches your model alias exactly
        }
    ],
      order: [["created_at", "DESC"]],
    });

    // Transform data to determine Current Availability
    const vehiclesWithStatus = vehicles.map(vehicle => {
      const v = vehicle.toJSON();
      const isOccupiedToday = v.bookings && v.bookings.length > 0;
      
      return {
        ...v,
        currentAvailability: isOccupiedToday ? "booked" : "available",
        bookings: undefined 
      };
    });

    res.status(200).json({
      success: true,
      count: vehiclesWithStatus.length,
      vehicles: vehiclesWithStatus,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add this to vehicleController.js
exports.getPublicVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findOne({
      where: {
        id,
        status: "approved"
      }
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    res.status(200).json({ success: true, vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
