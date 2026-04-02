const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");

const Chat = {
  // GET CHAT HISTORY
  findByBookingId: async (bookingId) => {
    const query = `
      SELECT m.*, u.name as sender_name, u.profile_image 
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.booking_id = :bookingId
      ORDER BY m.created_at ASC;
    `;
    return await sequelize.query(query, {
      replacements: { bookingId: parseInt(bookingId) },
      type: QueryTypes.SELECT,
    });
  },

  // GET OWNER BY BOOKING ID
  getOwnerByBookingId: async (bookingId) => {
    try {
      const query = `
        SELECT u.id, u.name, u.email, u.profile_image
        FROM "Bookings" b
        JOIN "Vehicles" v ON b."vehicleId" = v."id"
        JOIN "users" u ON v."userId" = u.id
        WHERE b.id = :bookingId;
      `;
      const result = await sequelize.query(query, {
        replacements: { bookingId: parseInt(bookingId) },
        type: QueryTypes.SELECT,
      });

      return result[0];
    } catch (err) {
      console.error("Database Error (getOwnerByBookingId):", err);
      throw err;
    }
  },

  // MARK AS SEEN
  markAsSeen: async (bookingId, userId) => {
    try {
      const query = `
        UPDATE messages 
        SET is_seen = true 
        WHERE booking_id = :bookingId 
        AND sender_id != :userId 
        AND is_seen = false;
      `;
      await sequelize.query(query, {
        replacements: { bookingId, userId },
        type: QueryTypes.UPDATE,
      });
      return { success: true };
    } catch (err) {
      console.error("Error marking seen:", err);
      throw err;
    }
  },

  // EDIT MESSAGE
  editMessage: async (messageId, senderId, newText) => {
    try {
      const query = `
        UPDATE messages 
        SET message = :newText, is_edited = true, updated_at = NOW()
        WHERE id = :messageId AND sender_id = :senderId
        RETURNING *;
      `;
      const result = await sequelize.query(query, {
        replacements: { messageId, senderId, newText },
        type: QueryTypes.SELECT,
      });
      return result[0];
    } catch (err) {
      console.error("Error editing message:", err);
      throw err;
    }
  },

  // DELETE MESSAGE
  deleteMessage: async (messageId, senderId) => {
    try {
      const query = `
        UPDATE messages 
        SET message = 'This message was deleted', deleted_at = NOW()
        WHERE id = :messageId AND sender_id = :senderId
        RETURNING *;
      `;
      const result = await sequelize.query(query, {
        replacements: { messageId, senderId },
        type: QueryTypes.SELECT,
      });
      return result[0];
    } catch (err) {
      console.error("Error deleting message:", err);
      throw err;
    }
  },

  // Delete all messages in a booking (Clear Chat)
  deleteAllMessages: async (bookingId) => {
  try {
    const query = `
      DELETE FROM messages 
      WHERE booking_id = :bookingId;
    `;
    await sequelize.query(query, {
      replacements: { bookingId: parseInt(bookingId) },
      type: QueryTypes.DELETE
    });
    return { success: true };
  } catch (err) {
    console.error("Delete Error:", err);
    throw err;
  }
},
  // CREATE NEW MESSAGE
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
          message,
        },
        type: QueryTypes.INSERT,
      });
      return result[0][0];
    } catch (err) {
      console.error("Database Error (create):", err);
      throw err;
    }
  },

  // GET INBOX
  getInbox: async (userId) => {
    try {
      const query = `
        SELECT DISTINCT ON (m."booking_id") 
          m."booking_id" as "bookingId", 
          m."message" as "lastMessage", 
          m."created_at" as "lastTime",
          m."is_seen" as "isSeen",
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
        type: QueryTypes.SELECT,
      });
    } catch (err) {
      console.error("Database Error (getInbox):", err);
      throw err;
    }
  },
};

module.exports = Chat;
