// server/src/models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'id' },
  name: { type: DataTypes.STRING, allowNull: false, field: 'name' },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, field: 'email' },
  mobile: { type: DataTypes.STRING, allowNull: true, field: 'mobile' },
  password: { type: DataTypes.STRING, allowNull: false, field: 'password' },
  profileImage: { type: DataTypes.JSON, allowNull: true, field: 'profile_image' },
  role: { type: DataTypes.ENUM("owner", "renter", "admin"), defaultValue: "renter", field: 'role' },
  resetPasswordToken: { type: DataTypes.STRING, allowNull: true, field: 'reset_password_token' },
  resetPasswordExpires: { type: DataTypes.DATE, allowNull: true, field: 'reset_password_expires' },
}, {
  tableName: "users",
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

User.findByEmail = async function(email) {
  return await this.findOne({ where: { email } });
};

User.findById = async function(id) {
  return await this.findByPk(id);
};

User.updateResetToken = async function(id, token, expiresAt) {
  const user = await this.findByPk(id);
  if (!user) return null;
  user.resetPasswordToken = token;
  user.resetPasswordExpires = expiresAt;
  await user.save();
  return user;
};

User.findByResetToken = async function(token) {
  return await this.findOne({ where: { resetPasswordToken: token } });
};

User.updatePassword = async function(id, hashedPassword) {
  const user = await this.findByPk(id);
  if (!user) return null;
  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();
  return user;
};

module.exports = User;
