// src/routes/verificationRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/cloudinaryUpload");
const verifyRole = require("../middleware/verifyRole");
const authenticateUser = require("../middleware/authMiddleware");
const { createVerification, getAllVerifications, getVerificationById, approveVerification, rejectVerification } = require("../controllers/verificationController");


// Multiple file fields
const uploadFields = upload.fields([
  { name: "selfie", maxCount: 1 },
  { name: "license", maxCount: 2 },
  { name: "citizenship", maxCount: 2 },
  { name: "bluebook", maxCount: 10 },
  { name: "vehicleImages", maxCount: 5 }, 
]);

// POST verification
router.post("/create",
  uploadFields, createVerification);

// GET all verifications
router.get("/dashboard/admin",
  authenticateUser,
  verifyRole(["admin"]),
  getAllVerifications);

// GET verification by ID
router.get("/dashboard/admin/:id",
  authenticateUser,
  verifyRole(["admin"]),
  getVerificationById);

// PUT approve verification
router.put("/dashboard/admin/approve/:id",
  authenticateUser,
  verifyRole(["admin"]),
  approveVerification);

// PUT reject verification
router.put("/dashboard/admin/reject/:id",
  authenticateUser,
  verifyRole(["admin"]),
  rejectVerification);

module.exports = router;
