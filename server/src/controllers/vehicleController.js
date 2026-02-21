const Notification = require("../models/Notification");
const Location = require("../models/Location");

const { Op } = require("sequelize");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");

exports.getApprovedVehicles = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const vehicles = await Vehicle.findAll({
      where: { status: "approved" },
      include: [{
        model: Booking,
        as: 'bookings',
        required: false,
        where: {
          bookingStatus: 'confirmed',
          startDate: { [Op.lte]: today },
          endDate: { [Op.gte]: today }
        }
      },
      {
          model: Location,
          as: 'location',
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

// get vehicles for user that have posted for verification
exports.getMyVehicles = async (req, res) => {
  try {
    const userId = req.user.id;
    const vehicles = await Vehicle.findAll({
      where: { userId },
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  }
    catch (error) {
      console.error("Error fetching user's vehicles:", error);
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


exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const files = req.files;
  
    const { 
      vehicleCondition, 
      pricePerDay, 
      locationId, 
      availabilityStatus 
    } = req.body;

    const vehicle = await Vehicle.findOne({ where: { id, userId } });

    if (!vehicle) {
      return res.status(404).json({ 
        success: false, 
        message: "Vehicle not found or you are not authorized to edit it." 
      });
    }

    let currentDocs = typeof vehicle.documentImage === 'string' 
      ? JSON.parse(vehicle.documentImage) 
      : vehicle.documentImage;

    if (files && files.vehicleImages) {
      currentDocs = {
        ...currentDocs,
        vehicleImages: files.vehicleImages.map(f => f.path)
      };
      vehicle.changed('documentImage', true);
    }

    await vehicle.update({
      vehicleCondition: vehicleCondition || vehicle.vehicleCondition,
      pricePerDay: pricePerDay || vehicle.pricePerDay,
      locationId: locationId ? parseInt(locationId) : vehicle.locationId,
      availabilityStatus: availabilityStatus || vehicle.availabilityStatus,
      documentImage: currentDocs,
    });

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle,
    });

  } catch (error) {
    console.error("Error updating vehicle:", error);
    res.status(500).json({ 
      success: false, 
      message: "Update failed", 
      error: error.message 
    });
  }
};


exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await Vehicle.destroy({
      where: { id, userId }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found or you don't have permission to delete it.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const vehicle = await Vehicle.findOne({
      where: { 
        id, 
        userId
      }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    console.error("Error in getVehicleById:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
