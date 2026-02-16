// server/src/utils/email.js
const nodemailer = require("nodemailer");

async function sendOtpEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"Smart Sawari" <no-reply@smartsawari.com>',
    to: email,
    subject: "Your Password Reset OTP",
    html: `<p>Your OTP for password reset is:</p>
           <h2>${otp}</h2>
           <p>This OTP will expire in 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

 async function sendPayoutReceipt(email, payoutDetails) {
  const mailOptions = {
    from: '"Smart Sawari" <koiralanischal01@gmail.com>',
    to: email,
    subject: "Payout Confirmed: Smart Sawari Receipt",
    html: `
      <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color: #2563eb;">Payment Receipt</h2>
        <p>Dear Partner, your payout has been successfully processed.</p>
        <hr>
        <p><strong>Amount Released:</strong> Rs. ${payoutDetails.amount}</p>
        <p><strong>E-Sewa Mobile:</strong> ${payoutDetails.esewaMobile}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p style="font-size: 12px; color: #666;">This is an automated receipt for your Smart Sawari earnings.</p>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, sendPayoutReceipt };