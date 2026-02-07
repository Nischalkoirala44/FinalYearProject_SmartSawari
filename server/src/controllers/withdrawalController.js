const Withdrawal = require("../models/Withdrawal");
const User = require("../models/User");

exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, method, paymentDetails } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);

    if (parseFloat(user.earningsBalance) < parseFloat(amount)) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    await user.decrement('earningsBalance', { by: amount });

    const request = await Withdrawal.create({
      userId,
      amount,
      method,
      paymentDetails,
      status: 'pending'
    });

    res.status(200).json({ success: true, message: "Withdrawal request submitted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllWithdrawals = async (req, res) => {
  try {
    const requests = await Withdrawal.findAll({
      where: { status: "pending" },
      include: [{ model: User, attributes: ["name", "email"] }],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve/Reject Request
exports.updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await Withdrawal.findByPk(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (status === "rejected") {
      // Refund the user's balance if rejected
      await User.increment("earningsBalance", {
        by: request.amount,
        where: { id: request.userId },
      });
    }

    request.status = status;
    await request.save();

    res.status(200).json({ success: true, message: `Withdrawal ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};