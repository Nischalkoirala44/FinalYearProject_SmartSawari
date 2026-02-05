const User = require("../models/User");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const cloudinary = require("../config/cloudinary");
dotenv.config();

// Register user
const registerUser = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    if (!name || !email || !mobile || !password || !role) {
      return res
        .status(400)
        .json({ message: "All fields are required including role" });
    }

    if (!["renter", "owner"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check if email exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      mobile,
      password: hashed,
      role,
    });

    res.status(201).json({ message: "User Registered Successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const profileImageUrl = req.file.path; // How?????
    await User.update(
      { profileImage: profileImageUrl },
      { where: { id: req.user.id } }
    );
    res.json({ message: "Profile picture uploaded", profileImageUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// helper function to handle profile image upload
const handleProfileUpload = async (file, userId) => {
  if (!file) return null;

  const profileImageUrl = file.path; // multer file path
  await User.update(
    { profileImage: profileImageUrl },
    { where: { id: userId } }
  );
  return profileImageUrl;
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;

    if (req.file) {
      const profileImageUrl = await handleProfileUpload(req.file, req.user.id);
      user.profileImage = profileImageUrl;
    }

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// UPDATE PASSWORD
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  registerUser,
  updateProfile,
  updatePassword,
  uploadProfilePicture,
};
