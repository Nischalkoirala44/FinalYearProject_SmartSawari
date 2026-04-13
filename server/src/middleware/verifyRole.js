// server/src/middlewares/verifyRole.js
const jwt = require("jsonwebtoken");

const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

      if (!token) {
         console.log("No token found in cookies or authorization header");
         return res.status(401).json({ message: "Unauthorized: No token" });
       }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET);

      req.user = decoded;

      // check if user's role is in allowedRoles
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }

      next(); // continue to route
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

module.exports = verifyRole;
