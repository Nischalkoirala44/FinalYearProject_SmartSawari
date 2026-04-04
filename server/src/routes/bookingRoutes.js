const express = require("express");
const authenticateUser = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/verifyRole");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.post("/intent", bookingController.createBookingIntent);

router.get("/verify-esewa", bookingController.verifyEsewaPayment);

router.post("/release-amount/:bookingId",
    // verifyRole("admin"),
    bookingController.releaseBookingAmount);

router.get("/pending-payouts",
    // verifyRole("admin"),
    bookingController.getPendingPayouts);

router.post("/partial-release/:bookingId",
    // verifyRole("admin"),
    bookingController.releasePartialAmount);

router.get("/stats",
    authenticateUser,
    // verifyRole("owner"),
    bookingController.getOwnerEarnings);

router.get("/user-bookings",
    authenticateUser,
    bookingController.getMyBookings);

router.get("/owner-bookings", authenticateUser, bookingController.getOwnerBookings);

router.post("/:bookingId/cancel", authenticateUser, bookingController.cancelBooking);

module.exports = router;