const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Booking = sequelize.define(
  "Booking",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    amountReleased: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    bookingId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    vehicleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    renterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed"),
      defaultValue: "pending",
    },
    bookingStatus: {
      type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed"),
      defaultValue: "pending",
    },

    amountAlreadyReleased: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },

    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = Booking;

/*
const Vehicle = require("./Vehicle");
const Location = require("./Location");

Vehicle.hasMany(Booking, { foreignKey: "vehicleId", as: "bookings" });
Booking.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });

const User = require("./User");
Vehicle.belongsTo(User, { foreignKey: "userId", as: "owner" });
User.hasMany(Vehicle, { foreignKey: "userId", as: "vehicles" });

Booking.belongsTo(User, { foreignKey: "renterId", as: "renter" });
User.hasMany(Booking, { foreignKey: "renterId", as: "rentedBookings" });

Location.hasMany(Vehicle, { foreignKey: 'locationId' });
Vehicle.belongsTo(Location, { foreignKey: 'locationId', as: 'location' });
*/
