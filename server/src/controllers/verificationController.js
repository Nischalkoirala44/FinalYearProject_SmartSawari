const Vehicle = require("../models/Vehicle");
const Location = require("../models/Location");
const { sendNotification } = require("../utils/notificationService");

exports.createVerification = async (req, res) => {
  try {
    const files = req.files || {}; 

    // Auth Check
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    const {
      registrationNumber,
      vehicleType,
      vehicleCondition,
      pricePerDay,
      locationId,
    } = req.body;

    // Field Validation
    if (!registrationNumber || !vehicleType || !vehicleCondition || !pricePerDay || !locationId) {
      return res.status(400).json({
        success: false,
        message: "Telemetry incomplete. All vehicle configuration fields are mandatory.",
      });
    }

    // Critical Document Validation
    if (!files.license || !files.citizenship || !files.bluebook) {
      return res.status(400).json({
        success: false,
        message: "Compliance failure: License, Citizenship, and Bluebook data required.",
      });
    }

    // Structure Document Object
    const documentImage = {
      selfie: files.selfie?.map((f) => f.path) || [],
      license: files.license?.map((f) => f.path) || [],
      citizenship: files.citizenship?.map((f) => f.path) || [],
      bluebook: files.bluebook?.map((f) => f.path) || [],
      vehicleImages: files.vehicleImages?.map((f) => f.path) || [],
    };

    // Database Commitment
    const verification = await Vehicle.createVerification({
      registrationNumber,
      vehicleType,
      vehicleCondition,
      pricePerDay: parseFloat(pricePerDay),
      documentImage,
      status: "pending",
      userId: req.user.id,
      locationId: parseInt(locationId),
      remarks: "System: Pending administrative clearance",
    });

    res.status(201).json({
      success: true,
      message: "Asset queued for verification.",
      verification,
    });
  } catch (err) {
    console.error("Verification sequence failed:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error during verification.",
      error: err.message,
    });
  }
};

// Get all pending verifications
exports.getAllVerifications = async (req, res) => {
  try {
    const verifications = await Vehicle.findAll({
      where: { status: ["pending", "approved", "rejected"] },
    });

    res.status(200).json({
      success: true,
      verifications,
    });
  } catch (error) {
    console.log("ya error", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get verification by ID
exports.getVerificationById = async (req, res) => {
  try {
    const verification = await Vehicle.findByPk(req.params.id, {
      include: ["location"],
    });

    if (!verification) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.status(200).json({ success: true, verification });
  } catch (error) {
    console.log("Error in getVerificationById:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve verification
exports.approveVerification = async (req, res) => {
  try {
    const id = req.params.id;

    // Find the record by primary key
    const verification = await Vehicle.findByPk(id);
    if (!verification) {
      return res
        .status(404)
        .json({ success: false, message: "Verification not found" });
    }

    // Update the status and remarks
    verification.status = "approved";
    verification.remarks = "Verified by admin";
    await verification.save(); // Save changes

    // Send notification
    await sendNotification(
      verification.userId,
      "Your vehicle verification has been approved.",
    );

    res.status(200).json({
      success: true,
      message: "Verification approved",
      verification,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject verification
exports.rejectVerification = async (req, res) => {
  try {
    const id = req.params.id;
    const { remarks } = req.body || {};

    // Find the record by primary key
    const verification = await Vehicle.findByPk(id);
    if (!verification) {
      return res
        .status(404)
        .json({ success: false, message: "Verification not found" });
    }

    // Update the status and remarks
    verification.status = "rejected";
    verification.remarks = remarks || "Rejected by admin";
    await verification.save(); // Save changes

    // Send notification
    await sendNotification(
      verification.userId,
      "Your vehicle verification was rejected. Please re-submit the details.",
    );

    res.status(200).json({
      success: true,
      message: "Verification rejected",
      verification,
    });
  } catch (error) {
    console.log("Error in rejectVerification:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
