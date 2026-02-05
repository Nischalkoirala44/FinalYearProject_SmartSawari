const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const crypto = require("crypto");
const { sendOtpEmail } = require("../utils/email");

dotenv.config();

const loginUser = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let userData = null;

    // Admin login
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      userData = {
        id: "admin-env",
        name: "Admin",
        email,
        role: "admin",
      };
    } else {
      // Normal user login
      const user = await User.findByEmail(email);
      if (!user) return res.status(400).json({ message: "User does not exist" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid password" });

      userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profileImage: user.profileImage || null,
      };
    }

    // JWT
    const token = jwt.sign(
      userData,
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? "30d" : "1d" }
    );

    // Set JWT cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: userData.role === "admin" ? "Admin login successful" : "Login successful",
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Logout: just clear the cookie
const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Forgot Password: Send OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res
        .status(200)
        .json({ message: "If the user exists, OTP is sent" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    // Set expiry 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save hashed OTP + expiry in DB
    user.resetPasswordToken = hashedOTP;
    user.resetPasswordExpires = expiresAt;
    await user.save();

    // Send OTP via email
    await sendOtpEmail(user.email, otp);

    console.log("OTP sent:", otp);
    console.log("Expires at:", expiresAt.toISOString());

    res.status(200).json({ message: "OTP sent to your email", expiresAt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};


// Reset Password: Verify OTP and set new password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Hash the OTP received from user
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOTP !== user.resetPasswordToken)
      return res.status(400).json({ message: "Invalid OTP" });

    // FIX: Convert DB timestamp to UTC for comparison
    const expiresTime = new Date(user.resetPasswordExpires + "Z").getTime();
    if (!user.resetPasswordExpires || expiresTime < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    // Hash new password and save
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
};
