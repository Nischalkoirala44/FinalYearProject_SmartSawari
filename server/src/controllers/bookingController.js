const crypto = require("crypto");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const { Op } = require("sequelize");

// Create Booking Intent
exports.createBookingIntent = async (req, res) => {
  try {
    const { vehicleId, renterId, startDate, endDate, totalAmount } = req.body;

    // Check for overlapping CONFIRMED bookings
    const overlapping = await Booking.findOne({
      where: {
        vehicleId,
        bookingStatus: "confirmed",
        [Op.and]: [
          { startDate: { [Op.lte]: endDate } },
          { endDate: { [Op.gte]: startDate } } 
        ]
      }
    });

    if (overlapping) {
      return res.status(400).json({ 
        success: false,
        message: `Vehicle is unavailable from ${overlapping.startDate} to ${overlapping.endDate}.` 
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
    
    const signature = crypto.createHmac("sha256", secret)
      .update(signatureString)
      .digest("base64");

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

// Verify Payment
exports.verifyEsewaPayment = async (req, res) => {
  try {
    const { data } = req.query;
    if (!data) return res.redirect(`${process.env.CLIENT_URL}/payment-failed`);

    const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    
    if (decoded.status === "COMPLETE") {
      const booking = await Booking.findOne({ 
        where: { bookingId: decoded.transaction_uuid }
      });

      if (booking && booking.paymentStatus !== "paid") {
        
        await booking.update({
          paymentStatus: "paid",
          bookingStatus: "confirmed",
          transactionId: decoded.transaction_code || "ESEWA_REF",
          amountReleased: false // Track that owner hasn't been paid yet
        });
        
        return res.redirect(`${process.env.CLIENT_URL}/payment-success?ref=${decoded.transaction_uuid}`);
      } else if (booking && booking.paymentStatus === "paid") {
        return res.redirect(`${process.env.CLIENT_URL}/payment-success?ref=${decoded.transaction_uuid}`);
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
      where: { bookingId, paymentStatus: "paid" },
      include: [{ model: Vehicle, as: 'vehicle' }]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const totalBookingAmount = parseFloat(booking.totalAmount);
    
    const maxOwnerShare = totalBookingAmount * 0.90; 
    
    const releasedSoFar = parseFloat(booking.amountAlreadyReleased || 0);
    const requestedRelease = parseFloat(customAmount);

    if (releasedSoFar + requestedRelease > maxOwnerShare) {
      const remainingPossible = maxOwnerShare - releasedSoFar;
      return res.status(400).json({ 
        success: false, 
        message: `Limit Exceeded. Max owner share (90%) is Rs. ${maxOwnerShare}. You can only release Rs. ${remainingPossible.toFixed(2)} more.` 
      });
    }

    const ownerId = booking.vehicle?.userId;

    // Increment User Wallet 
    await User.increment(
      { 
        earningsBalance: requestedRelease,
        totalEarned: requestedRelease 
      },
      { where: { id: ownerId } }
    );
    
    // Update Booking tracking
    const newReleasedTotal = releasedSoFar + requestedRelease;
    await booking.update({ 
      amountAlreadyReleased: newReleasedTotal,
      amountReleased: newReleasedTotal >= maxOwnerShare 
    });

    res.status(200).json({ 
      success: true, 
      message: `Rs. ${requestedRelease} released. Owner has received Rs. ${newReleasedTotal} of their Rs. ${maxOwnerShare} total share.` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.releaseBookingAmount = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      where: { bookingId, paymentStatus: "paid", amountReleased: false },
      include: [{ model: Vehicle, as: 'vehicle' }]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found or already released" });
    }

    const total = parseFloat(booking.totalAmount);
    const ownerShare = total * 0.90;
    const ownerId = booking.vehicle?.userId;

    if (!ownerId) {
      return res.status(400).json({ success: false, message: "Owner not associated with this vehicle" });
    }

    // Increment current balance AND lifetime earnings
    await User.increment(
      { 
        earningsBalance: ownerShare,
        totalEarned: ownerShare 
      },
      { where: { id: ownerId } }
    );
    
    await booking.update({ amountReleased: true });

    res.status(200).json({ 
      success: true, 
      message: `Rs. ${ownerShare} released to owner successfully.` 
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
        amountReleased: false 
      },
      include: [
        { 
          model: Vehicle, 
          as: 'vehicle',
          attributes: ['registrationNumber', 'vehicleType', 'pricePerDay'],
          include: [{ model: User, as: 'owner', attributes: ['name', 'email'] }]
        },
        { 
          model: User, 
          as: 'renter',
          attributes: ['name'] 
        }
      ],
      order: [['createdAt', 'ASC']]
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
      include: [{
        model: Vehicle,
        as: 'vehicle',
        where: { userId: ownerId },
        attributes: []
      }],
      where: { paymentStatus: 'paid' },
      attributes: [
        'amountReleased',
        'totalAmount'
      ]
    });

    let totalLifetime = 0;
    let pendingRelease = 0;
    let alreadyReleased = 0;

    stats.forEach(b => {
      const ownerCut = parseFloat(b.totalAmount) * 0.90;
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
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};