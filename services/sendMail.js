const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendMail = async (data) => {
    try {
      const { to, subject, html } = data;
      const info = await transporter.sendMail({
        from: '"Verify OTP 👻" <care@instagram.com>',
        to: to,
        subject: subject,
        html: html,
      });
      return info;
    } catch (err) {
      console.log(err);
      return {message: err.message}
    }
};
