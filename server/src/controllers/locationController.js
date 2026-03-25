// server/src/controllers/locationController.js
const Location = require("../models/Location");

exports.addLocation = async (req, res) => {
  try {
    const { locationName, province, city, addressLine, latitude, longitude } = req.body;
    
    const location = await Location.create({
      locationName,
      province,
      city,
      addressLine, 
      latitude,
      longitude,
      userId: req.user.id
    });

    res.status(201).json({ success: true, data: location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyLocations = async (req, res) => {
  try {
    const locations = await Location.findAll({ where: { userId: req.user.id } });
    res.status(200).json({ success: true, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 

exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id);

    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }

    res.status(200).json({ success: true, location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};