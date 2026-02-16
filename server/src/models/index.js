const User = require('./User');
const Vehicle = require('./Vehicle');
const Location = require('./Location');
const Booking = require('./Booking'); // 1. Add this import

// Vehicle <-> Location (This part you have)
Location.hasMany(Vehicle, { foreignKey: 'locationId' });
Vehicle.belongsTo(Location, { foreignKey: 'locationId', as: 'location' });

// 2. ADD THIS: Booking <-> Vehicle
Booking.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Vehicle.hasMany(Booking, { foreignKey: 'vehicleId' });

// 3. ADD THIS: Booking <-> User (Renter)
Booking.belongsTo(User, { foreignKey: 'renterId', as: 'renter' });

module.exports = { User, Vehicle, Location, Booking };