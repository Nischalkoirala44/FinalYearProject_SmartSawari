const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Vehicle = sequelize.define("Vehicle", {
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    field: 'userId' 
  },
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  registrationNumber: { type: DataTypes.STRING, allowNull: false },
  vehicleType: { type: DataTypes.STRING, allowNull: false },
  vehicleCondition: { type: DataTypes.STRING, allowNull: false },
  pricePerDay: { type: DataTypes.FLOAT, allowNull: false },
  documentImage: { type: DataTypes.JSONB, allowNull: false },
  status: { type: DataTypes.ENUM("pending", "approved", "rejected"), defaultValue: "pending" },
  remarks: { type: DataTypes.JSONB, allowNull: true },
}, {
  tableName: "Vehicles",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
});

Vehicle.createVerification = async function(data) {
  return await this.create(data);
};

module.exports = Vehicle;