const express = require("express");
const authenticateUser = require("../middleware/authMiddleware.js");
const router = express.Router();
const upload = require("../middleware/multer.js");

const {
  registerUser,
  updateProfile,
  updatePassword,
  uploadProfilePicture,
  getProfile
} = require("../controllers/userController");

router.post("/register", registerUser);

router.put("/profile", 
  authenticateUser,
  upload.single("profileImage"),
  updateProfile);

router.put("/password", 
  authenticateUser, 
  updatePassword);

router.post(
  "/upload-profile-picture",
  authenticateUser,
  upload.single("profileImage"),
  uploadProfilePicture
);

router.get('/getprofile', authenticateUser, getProfile);

module.exports = router;
