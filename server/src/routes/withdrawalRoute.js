const {requestWithdrawal, getAllWithdrawals, updateWithdrawalStatus} = require("../controllers/withdrawalController");
const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authMiddleware");

// POST request for withdrawal
router.post("/request", authenticateUser, requestWithdrawal);

router.get("/admin/requests", authenticateUser, getAllWithdrawals);

router.patch("/admin/requests/:id", authenticateUser, updateWithdrawalStatus);

module.exports = router;