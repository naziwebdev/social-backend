const userModel = require("../../models/User");
const { registerSchemaٰValidator } = require("./auth.validator");

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

    return res.status(201).json({ message: "user registerd successfully" });
  } catch (error) {
    next(error);
  }
};
