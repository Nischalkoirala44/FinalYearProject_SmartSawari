const sequelize = require("../config/db"); 
const { QueryTypes } = require("sequelize");

const Chat = {
  // ── 1. GET CHAT HISTORY ──
  // Used when a specific chat is opened
  findByBookingId: async (bookingId) => {
    try {
      const query = `
        SELECT m.*, u.name as sender_name, u.profile_image 
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.booking_id = :bookingId
        ORDER BY m.created_at ASC;
      `;

      return await sequelize.query(query, {
        replacements: { bookingId: parseInt(bookingId) },
        type: QueryTypes.SELECT
      });
    } catch (err) {
      console.error("Database Error (findByBookingId):", err);
      throw err;
    }
  },

  // ── 2. CREATE MESSAGE ──
  // Used when a user sends a new message
  create: async (bookingId, senderId, message) => {
    try {
      const query = `
        INSERT INTO messages (booking_id, sender_id, message, created_at, updated_at) 
        VALUES (:bookingId, :senderId, :message, NOW(), NOW()) 
        RETURNING *;
      `;
      
      const result = await sequelize.query(query, {
        replacements: { 
          bookingId: parseInt(bookingId), 
          senderId: parseInt(senderId), 
          message 
        },
        type: QueryTypes.INSERT
      });
      
      // result[0] is the inserted row in PostgreSQL
      return result[0][0]; 
    } catch (err) {
      console.error("Database Error (create):", err);
      throw err;
    }
  },

  getOwnerByBookingId: async (bookingId, currentUserId) => {
  try {
    const query = `
      SELECT u."name" as "ownerName", u."profile_image" as "ownerImage"
      FROM "Bookings" b
      JOIN "Vehicles" v ON b."vehicleId" = v."id"
      JOIN "users" u ON (b."renterId" = u."id" OR v."userId" = u."id")
      WHERE b."id" = :bookingId
        AND u."id" != :currentUserId
      LIMIT 1;
    `;
    const result = await sequelize.query(query, {
      replacements: { 
        bookingId: parseInt(bookingId), 
        currentUserId: parseInt(currentUserId) 
      },
      type: QueryTypes.SELECT
    });
    return result[0] || null;
  } catch (err) {
    console.error("Database Error (getOwnerByBookingId):", err);
    throw err;
  }
},

  // ── 3. GET MESSENGER INBOX (New) ──
  // Used for the sidebar list (Owner name, image, last message)
  getInbox: async (userId) => {
    try {
      // models/Chat.js -> getInbox method

const query = `
  SELECT DISTINCT ON (m."booking_id") 
    m."booking_id" as "bookingId", 
    m."message" as "lastMessage", 
    m."created_at" as "lastTime",
    u."name" as "ownerName", 
    u."profile_image" as "ownerImage"
  FROM messages m
  JOIN "Bookings" b ON m."booking_id" = b."id"
  JOIN "Vehicles" v ON b."vehicleId" = v."id"
  JOIN "users" u ON (b."renterId" = u."id" OR v."userId" = u."id")
  WHERE (b."renterId" = :userId OR v."userId" = :userId) 
    AND u."id" != :userId
  ORDER BY m."booking_id", m."created_at" DESC;
`;

      return await sequelize.query(query, {
        replacements: { userId: parseInt(userId) },
        type: QueryTypes.SELECT
      });
    } catch (err) {
      console.error("Database Error (getInbox):", err);
      throw err;
    }
  }
};

module.exports = Chat;