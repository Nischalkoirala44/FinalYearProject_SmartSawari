const sequelize = require('../config/db');
const User = require('./User');
const Vehicle = require('./Vehicle');
const Location = require('./Location');
const Booking = require('./Booking');
const Notification = require('./Notification');
const Withdrawal = require('./Withdrawal');

// --- 1. Vehicle <-> Location ---
Location.hasMany(Vehicle, { foreignKey: 'locationId', as: 'vehicles' });
Vehicle.belongsTo(Location, { foreignKey: 'locationId', as: 'location' });

// --- 2. Booking <-> Vehicle ---
Vehicle.hasMany(Booking, { foreignKey: 'vehicleId', as: 'bookings' });
Booking.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

// --- 3. Booking <-> User (Renter) ---
User.hasMany(Booking, { foreignKey: 'renterId', as: 'rentedBookings' });
Booking.belongsTo(User, { foreignKey: 'renterId', as: 'renter' });

// --- 4. Vehicle <-> User (Owner) ---
User.hasMany(Vehicle, { foreignKey: 'userId', as: 'vehicles' });
Vehicle.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// --- 5. Withdrawal <-> User ---
User.hasMany(Withdrawal, { foreignKey: 'userId', as: 'withdrawals' });
Withdrawal.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// --- 6. Notification <-> User ---
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { 
  sequelize, 
  User, 
  Vehicle, 
  Location, 
  Booking,
  Notification,
  Withdrawal
};