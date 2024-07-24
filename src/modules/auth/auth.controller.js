const userModel = require("../../models/User");
const resetPasswordModel = require("../../models/ResetPassword");
const {
  registerSchemaٰValidator,
  loginSchemaٰValidator,
  forgetPasswordValidator,
  resetPasswordValidator,
} = require("./auth.validator");
const jwt = require("jsonwebtoken");
const bcrybt = require("bcryptjs");
const nodeMailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const RefreshTokenModel = require("../../models/RefreshToken");
require("dotenv").config();

exports.register = async (req, res, next) => {
  try {
    const { username, email, name, password } = req.body;

    await registerSchemaٰValidator.validate(
      { username, email, name, password },
      {
        abortEarly: false,
      }
    );

    const isExistUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });
    if (isExistUser) {
      return res.status(400).json({ message: "user exist alredy" });
    }

    let isFirstUser = (await userModel.countDocuments()) === 0;
    let role = "USER";
    if (isFirstUser) {
      role = "ADMIN";
    }

    user = new userModel({ username, email, name, password, role });
    user = await user.save();

    const accessToken = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30day",
    });

    const refreshToken = await RefreshTokenModel.createToken(user);

    res.cookie("access-token", accessToken, {
      maxAge: 259200000,
      httpOnly: true,
      sameSite: "strict",
    });

    res.cookie("refresh-token", refreshToken, {
      maxAge: 259200000,
      httpOnly: true,
      sameSite: "strict",
    });

    return res.status(201).json({ message: "user registerd successfully" });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    await loginSchemaٰValidator.validate(
      { email, password },
      {
        abortEarly: false,
      }
    );

    const user = await userModel.findOne({ email }).lean();

    if (!user) {
      return res
        .status(409)
        .json({ message: "email or password in incorrect" });
    }

    const verifyPassword = await bcrybt.compare(password, user.password);

    if (!verifyPassword) {
      return res
        .status(409)
        .json({ message: "email or password in incorrect" });
    }

    const accessToken = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30day",
    });

    const refreshToken = await RefreshTokenModel.createToken(user);

    res.cookie("access-token", accessToken, {
      maxAge: 259200000,
      httpOnly: true,
      sameSite: "strict",
    });

    res.cookie("refresh-token", refreshToken, {
      maxAge: 259200000,
      httpOnly: true,
      sameSite: "strict",
    });

    return res.status(200).json({ message: "user login successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ _id: req.user._id }, "-password");
    if (!user) {
      return res.status(404).json({ message: "not found user" });
    }

    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const refreshTokenoken = req.cookies["refresh-token"];

    const userID = await RefreshTokenModel.verifyToken(refreshTokenoken);

    if (!userID) {
      return res.status(409).json({ message: "refresh-token is invalid" });
    }

    const user = await userModel.findOne({ _id: userID });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const accessToken = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30day",
    });

    res.cookie("access-token", accessToken, {
      maxAge: 259200000,
      httpOnly: true,
      sameSite: "strict",
    });

    return res
      .status(200)
      .json({ message: "access token generate successfully" });
  } catch (error) {
    next(error);
  }
};

exports.forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    await forgetPasswordValidator.validate({ email });

    const token = uuidv4();

    const expireTimeToken = Date.now() + 60 * 60 * 1000;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "not found user" });
    }

    await resetPasswordModel.create({
      user: user._id,
      token,
      expireTime: expireTimeToken,
    });

    const transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: "panirsstegar@gmail.com",
        pass: "kocm cjhc risz cwpx",
      },
    });

    const mailOptions = {
      from: "panirsstegar@gmail.com",
      to: email,
      subject: "Reset Password Link For Your Social account",
      html: `
       <h2>Hi, ${user.name}</h2>
       <a href=http://localhost:3000/reset-password/${token}>Reset Password</a>
      `,
    };

    transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ message: "reset-password link send to your email" });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    await resetPasswordValidator.validate({ token, password });

    const resetPasswordDoc = await resetPasswordModel.findOne({
      token,
      expireTime: { $gt: Date.now() },
    });

    if (!resetPasswordDoc) {
      return res.status(403).json({ message: "this link is expired" });
    }

    const userUpdate = await userModel.findOneAndUpdate(
      { _id: resetPasswordDoc.user },
      {
        password,
      }
    );

    if (!userUpdate) {
      return res.status(409).json({ message: "reset password faild" });
    }

    await resetPasswordModel.findOneAndDelete({ _id: resetPasswordDoc._id });

    return res.status(200).json({ message: "password reset successfully" });
  } catch (error) {
    next(error);
  }
};
