const userModel = require("../../models/User");
const {
  registerSchemaٰValidator,
  loginSchemaٰValidator,
} = require("./auth.validator");
const jwt = require("jsonwebtoken");
const bcrybt = require("bcryptjs");
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
      maxAge: 90000000,
      httpOnly: true,
      sameSite: "strict",
    });

    res.cookie("refresh-token", refreshToken, {
      maxAge: 90000000,
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
      maxAge: 9000000,
      httpOnly: true,
      sameSite: "strict",
    });

    res.cookie("refresh-token", refreshToken, {
      maxAge: 9000000,
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

    const accessToken = jwt.sign({ userID:user._id }, process.env.JWT_SECRET, {
      expiresIn: "30day",
    });

    res.cookie("access-token", accessToken, {
      maxAge: 9000000,
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
