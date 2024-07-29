const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const OTP = require("../../models/otpVerification");

const sendOTPVerification = async ({ id, email, role }, res, { subject }) => {
  try {
    let mailOptions, otp, hashedOTP, resetLink;
    
    const transporter = nodemailer.createTransport({
      host: '172.19.50.162',
      port: 25,
      tls: {
        rejectUnauthorized: false,
      },
    });

    if (role === "User") {
      otp = `${Math.floor(1000 + Math.random() * 9000)}`;
      const salt = await bcrypt.genSalt();
      hashedOTP = await bcrypt.hash(otp, salt);

      mailOptions = {
        from: 'Ambersphere <notifications@mtc.com.na>',
        to: email,
        subject: subject,
        html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete your registration. <b>OTP will expire in 3 minutes.</b></p>`,
      };

      await OTP.create({
        userId: id,
        otp: hashedOTP,
        role,
        createdAt: Date.now(),
        expiresAt: Date.now() + 180000,
      });
    } else {
      const token = crypto.randomBytes(32).toString('hex');
      resetLink = `http://localhost:3000/reset-password?token=${token}&userId=${id}`;
      const salt = await bcrypt.genSalt();
      hashedOTP = await bcrypt.hash(token, salt);

      mailOptions = {
        from: 'Ambersphere <notifications@mtc.com.na>',
        to: email,
        subject: subject,
        html: `<p>Click the link below to reset your password. The link will expire in 1 hour.</p><p><a href="${resetLink}">Reset Password</a></p>`,
      };

      await OTP.create({
        userId: id,
        otp: hashedOTP,
        role,
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      });
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.status(500).json({
          status: "FAILURE",
          message: "Internal server error: " + error.message,
        });
      } else {
        res.status(201).json({
          status: "PENDING",
          message: `Email sent to ${email}.`,
          userId: id
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "FAILURE",
      message: "Internal Server Error: " + error.message,
    });
  }
};

module.exports = sendOTPVerification;
