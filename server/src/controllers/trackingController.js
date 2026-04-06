const { Op } = require("sequelize");
const { Vehicle, Booking } = require("../models");

exports.updateLiveLocation = async (req, res) => {
  const { bookingId, lat, lng } = req.body;

  try {
    const booking = await Booking.findByPk(bookingId);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: "No booking record found for this ID." 
      });
    }

    const allowedStatuses = ['confirmed', 'pending'];
    if (!allowedStatuses.includes(booking.bookingStatus)) {
       return res.status(403).json({ 
         success: false, 
         message: `Tracking not allowed for status: ${booking.bookingStatus}` 
       });
    }

    await Vehicle.update(
      { 
        currentLat: lat, 
        currentLng: lng, 
        lastTrackedAt: new Date() 
      },
      { where: { id: booking.vehicleId } }
    );

    res.status(200).json({ 
      success: true, 
      message: "Location synchronized.",
      updatedVehicleId: booking.vehicleId,
      newLocation: { lat, lng }
    });

  } catch (error) {
    console.error("Update Location Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getLiveLocation = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findOne({
      where: { bookingId: bookingId },
      include: [{ 
        model: Vehicle, 
        as: 'vehicle', 
        attributes: ['currentLat', 'currentLng', 'lastTrackedAt'] 
      }]
    });

    if (!booking || !booking.vehicle) {
      return res.status(404).json({ success: false, message: "Tracking data unavailable." });
    }

    res.status(200).json({
      success: true,
      data: {
        lat: parseFloat(booking.vehicle.currentLat),
        lng: parseFloat(booking.vehicle.currentLng),
        lastUpdated: booking.vehicle.lastTrackedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};