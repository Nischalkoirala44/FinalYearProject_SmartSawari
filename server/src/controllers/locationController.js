// server/src/controllers/locationController.js
const Location = require("../models/Location");
const axios = require('axios');

exports.proxyGeocode = async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing coordinates" });
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: lat,
        lon: lon,
        format: 'json'
      },
      headers: {
        'User-Agent': 'SmartSawari-FinalYearProject (koiralanischal01@gmail.com)',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    // Send the OSM data back to your Next.js frontend
    res.status(200).json(response.data);

  } catch (error) {
    console.error("OSM Proxy Error:", error.response ? error.response.data : error.message);
    res.status(502).json({ error: "Failed to fetch address from OSM" });
  }
};

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