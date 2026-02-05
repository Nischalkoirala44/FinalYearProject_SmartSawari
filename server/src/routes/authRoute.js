const express = require("express");
const router = express.Router();

const {
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController.js");
const authenticateUser = require("../middleware/authMiddleware.js");

router.post("/login", loginUser);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", authenticateUser, (req, res) => {
  res.json({ user: req.user });
});

router.get("/dashboard", authenticateUser, (req, res) => {
  const role = req.user.role;
  if (role === "owner") return res.json({ message: "Welcome Landlord!" });
  if (role === "renter") return res.json({ message: "Welcome Tenant!" });
  if (role === "admin") return res.json({ message: "Welcome Admin!" });
  res.status(403).json({ message: "Unauthorized" });
});

module.exports = router;
