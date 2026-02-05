const { Sequelize } = require("sequelize");

// Create a new Sequelize instance to connect to PostgreSQL database
const sequelize = new Sequelize(
  "SmartSawariDB",
  "postgres",
  "8080",
  {
    host: "localhost",
    dialect: "postgres",
    logging: false,
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL Connected Successfully!");
  } catch (err) {
    console.error("DB Connection Error:", err);
  }
})();

module.exports = sequelize;
