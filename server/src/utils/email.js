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

module.exports = { sendOtpEmail };
