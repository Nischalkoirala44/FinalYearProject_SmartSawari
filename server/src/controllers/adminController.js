const { Booking, User, Vehicle } = require("../models");
const { Sequelize, Op } = require("sequelize");

const getDashboardStats = async (req, res) => {
  try {
    // Financial Audit
    const stats = await Booking.findOne({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("totalAmount")), "grossRevenue"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "totalBookings"],
      ],
      where: { paymentStatus: "paid" },
      raw: true,
    });

    const grossVolume = parseFloat(stats?.grossRevenue) || 0;
    const adminCommission = grossVolume * 0.1;
    const userCount = await User.count();
    const vehicleCount = await Vehicle.count();

    // Booking Monitor
    const bookingCountsRaw = await Booking.findAll({
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
        { model: User, as: "renter", attributes: ["name", "email"] },
        { model: Vehicle, as: "vehicle", attributes: ["id", "vehicleType", "registrationNumber"] },
      ],
    });

    // Analytics: Revenue trend over the last 30 DAYS
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueTrend = await Booking.findAll({
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("createdAt")), "date"],
        [Sequelize.fn("SUM", Sequelize.col("totalAmount")), "dailyGross"],
      ],
      where: {
        paymentStatus: "paid",
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
      group: [Sequelize.fn("DATE", Sequelize.col("createdAt"))],
      order: [[Sequelize.fn("DATE", Sequelize.col("createdAt")), "ASC"]],
      raw: true,
    });

    // Zero-Filling Logic for 30 Days
    const last30DaysMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // Using 'MMM dd' format (e.g., "Apr 03") for better 30-day readability
      const dayLabel = d.toLocaleDateString("en-US", { month: 'short', day: '2-digit' });
      last30DaysMap[dayLabel] = 0;
    }

    // Fill in the real data from the DB
    revenueTrend.forEach((day) => {
      const dayLabel = new Date(day.date).toLocaleDateString("en-US", { month: 'short', day: '2-digit' });
      if (last30DaysMap.hasOwnProperty(dayLabel)) {
        last30DaysMap[dayLabel] = parseFloat((parseFloat(day.dailyGross) * 0.1).toFixed(2));
      }
    });

    const chartData = Object.keys(last30DaysMap).map(label => ({
      date: label,
      revenue: last30DaysMap[label]
    }));

    // Final Response
    return res.status(200).json({
      success: true,
      summary: {
        totalRevenue: parseFloat(adminCommission.toFixed(2)),
        grossVolume: grossVolume,
        totalBookings: parseInt(stats?.totalBookings) || 0,
        totalUsers: userCount,
        totalVehicles: vehicleCount,
      },
      bookingCounts: bookingCountsRaw.map(b => ({
        bookingStatus: b.bookingStatus,
        count: parseInt(b.get('count'))
      })),
      transactions: recentTransactions,
      analytics: chartData,
    });

  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching admin data",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};