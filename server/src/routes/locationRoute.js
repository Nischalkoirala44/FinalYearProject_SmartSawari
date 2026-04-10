const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware.js");
const locationController = require("../controllers/locationController.js");

router.post("/add", authenticateUser, locationController.addLocation);
router.get("/my-locations", authenticateUser, locationController.getMyLocations);
router.get("/proxy/geocode", locationController.proxyGeocode);
router.get("/:id", locationController.getLocationById);


module.exports = router;