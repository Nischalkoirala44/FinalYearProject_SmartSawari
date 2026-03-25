const cron = require("node-cron");
const { Booking, Vehicle, Notification } = require("../models");
const { Op } = require("sequelize");

// Check every day at 8:00 AM for vehicles whose rental ended yesterday
cron.schedule("0 8 * * *", async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = yesterday.toISOString().split('T');

    const finishedBookings = await Booking.findAll({
      where: {
        endDate: dateString,
        bookingStatus: "confirmed"
      },
      include: [{ model: Vehicle, as: 'vehicle' }]
    });

    for (const booking of finishedBookings) {
      if (booking.vehicle) {
        await Notification.create({
          userId: booking.vehicle.userId,
          title: "Vehicle Available for Rent! ✨",
          message: `The booking for ${booking.vehicle.registrationNumber} is officially over. Your vehicle is now back in the public listing.`,
          type: "VEHICLE_AVAILABLE"
        });
      }
      // Optional: Auto-complete the booking status
      await booking.update({ bookingStatus: "completed" });
    }
    console.log(`Cron Job: Processed ${finishedBookings.length} completed rentals.`);
  } catch (error) {
    console.error("Cron Job Error:", error);
  }
});