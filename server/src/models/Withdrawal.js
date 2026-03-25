const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Withdrawal = sequelize.define("Withdrawal", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  method: {
    type: DataTypes.ENUM("esewa", "khalti", "bank"),
    allowNull: false,
  },
  paymentDetails: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
  }
});

module.exports = Withdrawal;

/*
User.hasMany(Withdrawal, { foreignKey: "userId" });
Withdrawal.belongsTo(User, { foreignKey: "userId" });
*/