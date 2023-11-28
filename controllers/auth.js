const User = require("../models/User");
const {
  generateOTP,
  hashData,
  otpExpiryTime,
  compareData,
} = require("../services/AuthServices");
const { sendMail } = require("../services/sendMail");

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    const isUser = await User.findOne({ email: email });

    if (isUser && !isUser.verified) {
      await sendOTP(isUser.id, res);
      return;
    } else if (isUser) {
      res.status(400).json({
        status: "error",
        message: "You have already registered, Pleas log in",
      });
      return;
    } else {
      const hanshedPassword = await hashData(password);
      req.body.password = hanshedPassword;
      const user = new User(req.body);
      await user.save();
      sendOTP(user.id, res);
      return;
    }
  } catch (err) {
    console.log(err.message);
    res
      .status(400)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

const sendOTP = async (id, res) => {
  try {
    const user = await User.findById(id);
    const otp = generateOTP();
    console.log(otp);
    const otpHash = await hashData(otp);
    user.otp = otpHash;
    user.otpExpiryTime = otpExpiryTime();
    const otpData = {
      to: user.email,
      subject: "Verify your account through OTP",
      html: `<p>Your OTP is ${otp}</p>`,
    };
    await user.save();
    await sendMail(otpData);
    res.status(200).json({
      status: "success",
      message: "OTP sent successfully",
      email: user.email,
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(400)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.verify = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const user = await User.findOne({ email });
    const currentTime = new Date().getTime();
    if (!user) {
      res
        .status(400)
        .json({ status: "error", message: "Something went wrong!" });
      return;
    } else if (user.otpExpiryTime < currentTime) {
      res
        .status(400)
        .json({ status: "error", message: "Your session has been expired!" });
      return;
    } else {
      if (!(await compareData(otp, user.otp))) {
        res.status(400).json({ status: "error", message: "OTP is incorrect!" });
        return;
      } else {
        user.verified = true;
        user.otp = undefined;
        user.otpExpiryTime = undefined;
        await user.save();
        res.status(200).json({
          status: "success",
          message: "Account has been verified successfully",
          userId: user.id,
          following:user.following,
          username:user.username,
          avatar:user.avatar,
          name:user.name
        });
      }
    }
  } catch (err) {
    console.log(err.message);
    res
      .status(400)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res
        .status(400)
        .json({ status: "error", message: "Email or password is incorrect" });
      return;
    }

    const isPasswordCorrect = await compareData(password, user.password);
    if (!isPasswordCorrect) {
      res
        .status(400)
        .json({ status: "error", message: "Email or password is incorrect" });
      return;
    }

    res
      .status(200)
      .json({
        status: "success",
        message: "Logged in successfully",
        userId: user.id,
        following:user.following,
        username:user.username,
        avatar:user.avatar,
        name:user.name
      });
  } catch (err) {
    console.log(err.message);
    res
      .status(400)
      .json({ status: "error", message: "Some Internal Error Occured!" });
  }
};
