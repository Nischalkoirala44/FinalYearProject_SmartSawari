const crypto = require("crypto");
const Booking = require("../models/Booking");
const { Op } = require("sequelize");

// Check availability and Create Booking Intent
exports.createBookingIntent = async (req, res) => {
  try {
    const { vehicleId, renterId, startDate, endDate, totalAmount } = req.body;

    // Check for overlapping CONFIRMED bookings
    const overlapping = await Booking.findOne({
      where: {
        vehicleId,
        bookingStatus: "confirmed",
        [Op.and]: [
          { startDate: { [Op.lte]: endDate } }, // Existing start is before requested end
          { endDate: { [Op.gte]: startDate } } 
        ]
      }
    });

    if (overlapping) {
      return res.status(400).json({ 
        success: false,
        message: `Vehicle is unavailable. It is already booked from ${overlapping.startDate} to ${overlapping.endDate}.` 
      });
    }

    // If clear, create the intent
    const bookingId = `SB-${Date.now()}`;
    const newBooking = await Booking.create({
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
    
    const crypto = require("crypto");
    const signature = crypto.createHmac("sha256", secret).update(signatureString).digest("base64");

    res.status(200).json({
      success: true,
      signature,
      bookingId,
      product_code
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// eSewa Verification Callback
exports.verifyEsewaPayment = async (req, res) => {
  try {
    const { data } = req.query;
    if (!data) return res.redirect(`${process.env.CLIENT_URL}/payment-failed`);

    const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    
    console.log("eSewa Decoded Data:", decoded);

    if (decoded.status === "COMPLETE") {
      const booking = await Booking.findOne({ where: { bookingId: decoded.transaction_uuid } });

      if (booking) {
        await booking.update({
          paymentStatus: "paid",
          bookingStatus: "confirmed",
          transactionId: decoded.transaction_code || decoded.transaction_id || "ESEWA_REF"
        });
        
        return res.redirect(`${process.env.CLIENT_URL}/payment-success?ref=${decoded.transaction_uuid}`);
      }
    }
    res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
  } catch (error) {
    console.error("Verification Error:", error);
    res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
  }
};