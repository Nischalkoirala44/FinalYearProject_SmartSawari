const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.post("/intent", bookingController.createBookingIntent);

router.get("/verify-esewa", bookingController.verifyEsewaPayment);

module.exports = router;