// server/src/models/Location.js
const { DataTypes } = require("sequelize");
const Vehicle = require("./Vehicle");
const sequelize = require("../config/db");

const Location = sequelize.define("Location", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  locationName: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    comment: "E.g., Home Garage, Thamel Hub, etc." 
  },
  province: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  addressLine: { type: DataTypes.STRING, allowNull: false },
  latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: false },
  longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: false },
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    comment: "The owner who owns this location"
  }
}, { tableName: "locations", timestamps: true });

module.exports = Location;

Location.hasMany(Vehicle, { foreignKey: 'locationId', as: 'vehicles' });