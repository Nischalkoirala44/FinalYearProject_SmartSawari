const { Booking, User, Vehicle } = require("../models");
const { Sequelize } = require("sequelize");

const getDashboardStats = async (req, res) => {
  try {
    // Financial Audit: Fetch Gross Revenue from paid bookings
    const stats = await Booking.findOne({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("totalAmount")), "grossRevenue"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "totalBookings"],
      ],
      where: { paymentStatus: "paid" },
      raw: true 
    });

    // Business Logic: Admin earns 10% of Gross Revenue
    const grossVolume = parseFloat(stats.grossRevenue) || 0;
    const adminCommission = grossVolume * 0.10;

    // Resource Counts (Users & Fleet)
    const userCount = await User.count();
    const vehicleCount = await Vehicle.count(); 

    // Booking Monitor: Distribution of Statuses
    const bookingCounts = await Booking.findAll({
      attributes: [
        "bookingStatus",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["bookingStatus"],
    });

    // Recent Transactions
    const recentTransactions = await Booking.findAll({
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [
        { 
          model: User, 
          as: "renter", 
          attributes: ["name", "email"] 
        },
        { 
          model: Vehicle, 
          as: "vehicle", 
          attributes: ["id", "vehicleType", "registrationNumber"] 
        },
      ],
    });

    // Success Response
    res.status(200).json({
      success: true,
      summary: {
        totalRevenue: adminCommission, 
        grossVolume: grossVolume,      
        totalBookings: parseInt(stats.totalBookings) || 0,
        totalUsers: userCount,
        totalVehicles: vehicleCount, 
      },
      bookingCounts,
      transactions: recentTransactions,
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching admin data", 
      error: error.message 
    });
  }
};

module.exports = {
  getDashboardStats,
};