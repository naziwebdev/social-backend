const userModel = require("../../models/User");
const { registerSchemaٰValidator } = require("./auth.validator");
const jwt = require("jsonwebtoken");
const RefreshTokenModel = require("../../models/RefreshToken");
require('dotenv').config()

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
      maxAge: 900000,
      httpOnly: true,
    });

    res.cookie("refresh-token", refreshToken, {
      maxAge: 900000,
      httpOnly: true,
    });

    return res.status(201).json({ message: "user registerd successfully" });
  } catch (error) {
    next(error);
  }
};
