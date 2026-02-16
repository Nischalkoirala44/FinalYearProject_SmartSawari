const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware.js");
const locationController = require("../controllers/locationController.js");

router.post("/add", authenticateUser, locationController.addLocation);
router.get("/my-locations", authenticateUser, locationController.getMyLocations);

module.exports = router;