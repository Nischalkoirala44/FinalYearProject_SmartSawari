const crypto = require("crypto");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const Location = require("../models/Location");
const Notification = require("../models/Notification");
const axios = require("axios");
const { Op } = require("sequelize");
const { sendPayoutReceipt } = require("../utils/email");

// Create Booking Intent
exports.createBookingIntent = async (req, res) => {
  try {
    const { vehicleId, renterId, startDate, endDate, totalAmount } = req.body;

    // Check for overlapping CONFIRMED bookings
    const overlapping = await Booking.findOne({
      where: {
        vehicleId,
        bookingStatus: { [Op.in]: ["confirmed", "pending"] },
        [Op.and]: [
          { startDate: { [Op.lte]: endDate } },
          { endDate: { [Op.gte]: startDate } },
        ],
      },
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: `Vehicle is unavailable from ${overlapping.startDate} to ${overlapping.endDate}.`,
      });
    }

    const bookingId = `SB-${Date.now()}`;
    await Booking.create({
      bookingId,
      vehicleId,
      renterId,
      startDate,
      endDate,
      totalAmount,
      paymentStatus: "pending",
      bookingStatus: "pending",
    });

    // eSewa Signature
    const secret = process.env.ESEWA_SECRET_KEY || "8g7h3w9charter";
    const product_code = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
    const signatureString = `total_amount=${totalAmount},transaction_uuid=${bookingId},product_code=${product_code}`;

    const signature = crypto
      .createHmac("sha256", secret)
      .update(signatureString)
      .digest("base64");

    res.status(200).json({
      success: true,
      signature,
      bookingId,
      product_code,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify Payment
exports.verifyEsewaPayment = async (req, res) => {
  try {
    const { data } = req.query;
    if (!data) return res.redirect(`${process.env.CLIENT_URL}/payment-failed`);

    const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));

    if (decoded.status === "COMPLETE") {
      const booking = await Booking.findOne({
        where: { bookingId: decoded.transaction_uuid },
        include: [{ model: Vehicle, as: "vehicle" }],
      });

      if (booking && booking.paymentStatus !== "paid") {
        await booking.update({
          paymentStatus: "paid",
          bookingStatus: "confirmed",
          transactionId: decoded.transaction_code || "ESEWA_REF",
          amountReleased: false, // Track that owner hasn't been paid yet
        });

        await Notification.create({
          userId: booking.renterId,
          title: "Booking Confirmed! 🏍️",
          message: `Payment successful for Booking. Your ride is ready!`,
          type: "BOOKING_CONFIRMED",
        });

        if (booking.vehicle) {
          await Notification.create({
            userId: booking.vehicle.userId,
            title: "New Booking Received! 💰",
            message: `Your vehicle ${booking.vehicle.registrationNumber} has been booked from ${booking.startDate} to ${booking.endDate}.`,
            type: "NEW_BOOKING",
          });
        }

        return res.redirect(
          `${process.env.CLIENT_URL}/payment-success?ref=${decoded.transaction_uuid}`,
        );
      } else if (booking && booking.paymentStatus === "paid") {
        return res.redirect(
          `${process.env.CLIENT_URL}/payment-success?ref=${decoded.transaction_uuid}`,
        );
      }
    }

    res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
  } catch (error) {
    console.error("Verification Error:", error);
    res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
  }
};

exports.releasePartialAmount = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { customAmount } = req.body;

    const booking = await Booking.findOne({
      where: { bookingId, paymentStatus: "paid", bookingStatus: "confirmed" },
      include: [{ model: Vehicle, as: "vehicle" }],
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const totalBookingAmount = parseFloat(booking.totalAmount);

    const maxOwnerShare = totalBookingAmount * 0.9;

    const releasedSoFar = parseFloat(booking.amountAlreadyReleased || 0);
    const requestedRelease = parseFloat(customAmount);

    if (releasedSoFar + requestedRelease > maxOwnerShare) {
      const remainingPossible = maxOwnerShare - releasedSoFar;
      return res.status(400).json({
        success: false,
        message: `Limit Exceeded. Max owner share (90%) is Rs. ${maxOwnerShare}. You can only release Rs. ${remainingPossible.toFixed(2)} more.`,
      });
    }

    const ownerId = booking.vehicle?.userId;

    // Increment User Wallet
    await User.increment(
      {
        earningsBalance: requestedRelease,
        totalEarned: requestedRelease,
      },
      { where: { id: ownerId } },
    );

    // Update Booking tracking
    const newReleasedTotal = releasedSoFar + requestedRelease;
    await booking.update({
      amountAlreadyReleased: newReleasedTotal,
      amountReleased: newReleasedTotal >= maxOwnerShare,
    });

    await Notification.create({
      userId: ownerId,
      title: "Partial Payout Released 💸",
      message: `Rs. ${requestedRelease} has been released to your wallet for Booking ${bookingId}. Total released: Rs. ${newReleasedTotal.toFixed(2)}.`,
      type: "PARTIAL_PAYOUT",
    });

    res.status(200).json({
      success: true,
      message: `Rs. ${requestedRelease} released. Owner has received Rs. ${newReleasedTotal} of their Rs. ${maxOwnerShare} total share.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.releaseBookingAmount = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Fetch the booking and owner details
    const booking = await Booking.findOne({
      where: {
        bookingId,
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        amountReleased: false,
      },
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          include: [{ model: User, as: "owner" }],
        },
      ],
    });

    if (!booking || !booking.vehicle?.owner) {
      return res
        .status(404)
        .json({ success: false, message: "Booking or Owner not found" });
    }

    const owner = booking.vehicle.owner;
    const ownerShare = parseFloat(booking.totalAmount) * 0.9;

    if (!owner.esewaMobile) {
      return res.status(400).json({
        success: false,
        message: "Owner has no eSewa mobile registered.",
      });
    }

    const ESEWA_PAYOUT_URL = `${process.env.ESEWA_PAYOUT_URL} || https://uat.esewa.com.np/api/v1/disbursements/transfer`;

    const payoutPayload = {
      merchant_id: process.env.ESEWA_PRODUCT_CODE,
      amount: ownerShare,
      receiver_id: owner.esewaMobile,
      note: `Payout for Booking ${bookingId} on Smart Sawari`,
      transaction_uuid: `PAYOUT-${bookingId}-${Date.now()}`,
    };

    const esewaResponse = await axios.post(ESEWA_PAYOUT_URL, payoutPayload, {
      headers: { Authorization: `Bearer ${process.env.ESEWA_API_TOKEN}` },
    });

    // REAL WORLD ESEWA DISBURSEMENT END
    await User.increment(
      { earningsBalance: ownerShare, totalEarned: ownerShare },
      { where: { id: owner.id } },
    );

    await booking.update({ amountReleased: true });

    await Notification.create({
      userId: owner.id,
      title: "Payout Released! 💸",
      message: `Rs. ${ownerShare} has been transferred to your eSewa account (${owner.esewaMobile}) for Booking ${bookingId}.`,
      type: "PAYOUT_RELEASED",
    });

    await sendPayoutReceipt(owner.email, {
      bookingId: booking.bookingId,
      amount: ownerShare,
      esewaMobile: owner.esewaMobile,
    });

    console.log(
      `Rs. ${ownerShare} released to ${owner.name} (${owner.esewaMobile}) for Booking ${booking.bookingId}`,
    );

    res.status(200).json({
      success: true,
      message: `Rs. ${ownerShare} successfully transferred to ${owner.esewaMobile} via eSewa.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPendingPayouts = async (req, res) => {
  try {
    const pendingBookings = await Booking.findAll({
      where: {
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        amountReleased: false,
      },
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["registrationNumber", "vehicleType", "pricePerDay"],
          include: [
            { model: User, as: "owner", attributes: ["name", "email"] },
          ],
        },
        {
          model: User,
          as: "renter",
          attributes: ["name"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({ success: true, bookings: pendingBookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lifetime earnings
exports.getOwnerEarnings = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const stats = await Booking.findAll({
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          where: { userId: ownerId },
          attributes: [],
        },
      ],
      where: { paymentStatus: "paid" },
      attributes: ["amountReleased", "totalAmount"],
    });

    let totalLifetime = 0;
    let pendingRelease = 0;
    let alreadyReleased = 0;

    stats.forEach((b) => {
      const ownerCut = parseFloat(b.totalAmount) * 0.9;
      totalLifetime += ownerCut;

      if (b.amountReleased) {
        alreadyReleased += ownerCut;
      } else {
        pendingRelease += ownerCut;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalLifetime,
        pendingRelease,
        alreadyReleased,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBookingDetailsForRenter = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: {
        bookingId,
        renterId: userId,
      },
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          include: [
            {
              model: Location,
              as: "location",
            },
            {
              model: User,
              as: "owner",
              attributes: ["name", "mobile"],
            },
          ],
        },
      ],
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: {
        bookingId,
        renterId: userId,
      },
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["registrationNumber", "userId"],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking record not located.",
      });
    }

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This booking is already cancelled.",
      });
    }

    const now = new Date();
    const tripStart = new Date(booking.startDate);
    tripStart.setHours(0, 0, 0, 0);

    // If today is the start date or later, block cancellation
    if (now >= tripStart) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel. The rental window has already begun or passed.",
      });
    }

    const isPaid = booking.paymentStatus === "paid";
    const updatedPaymentStatus = isPaid ? "refund_pending" : "pending"; 

    await booking.update({
      bookingStatus: "cancelled",
      paymentStatus: updatedPaymentStatus,
    });

    // Notify Owner
    if (booking.vehicle) {
      await Notification.create({
        userId: booking.vehicle.userId,
        title: "Booking Cancelled ⚠️",
        message: `Renter cancelled booking ${bookingId} for ${booking.vehicle.registrationNumber}.`,
        type: "BOOKING_CANCELLED",
      });
    }

    // Notify Renter
    await Notification.create({
      userId: userId,
      title: "Cancellation Confirmed",
      message: isPaid
        ? "Your booking is cancelled. A full refund is being processed to your eSewa account."
        : "Your pending booking has been removed.",
      type: "BOOKING_CANCELLED",
    });

    res.status(200).json({
      success: true,
      message: isPaid
        ? "Booking cancelled. Refund request initiated."
        : "Booking cancelled successfully.",
      refundInitiated: isPaid,
    });
  } catch (error) {
    console.error("Cancellation Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during cancellation.",
      error: error.message,
    });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.findAll({
      where: { renterId: userId },
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: [
            "registrationNumber",
            "vehicleType",
            "vehicleCondition",
            "documentImage",
          ],
          include: [
            {
              model: Location,
              as: "location",
              attributes: [
                "locationName",
                "city",
                "addressLine",
                "province",
                "latitude",
                "longitude",
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

// Get all bookings for vehicles owned
exports.getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const bookings = await Booking.findAll({
      include: [
        {
          model: Vehicle,
          as: "vehicle",
          where: { userId: ownerId },
          attributes: [
            "id",
            "registrationNumber",
            "vehicleType",
            "pricePerDay",
            "documentImage",
          ],
          include: [
            {
              model: Location,
              as: "location",
              attributes: ["locationName", "city"],
            },
          ],
        },
        {
          model: User,
          as: "renter",
          attributes: ["name", "email", "mobile"],
        },
      ],
      // Sort by newest bookings first
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching owner bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your vehicle bookings",
      error: error.message,
    });
  }
};
