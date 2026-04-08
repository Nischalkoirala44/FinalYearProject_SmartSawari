const { Sequelize } = require("sequelize");

// Railway provides the full connection string in the DATABASE_URL variable
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Essential for connecting to cloud providers like Railway
    },
  },
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL Connected Successfully to Railway!");
  } catch (err) {
    console.error("DB Connection Error:", err.message);
  }
})();

module.exports = sequelize;