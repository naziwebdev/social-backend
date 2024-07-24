const userModel = require("../../models/User");
const {
  editUserValidator,
  editPasswordValidator,
} = require("./user.validators");

exports.editUser = async (req, res, next) => {
  try {
    const { name, username, email } = req.body;
    const user = req.user._id;
    await editUserValidator.validate(
      { name, username, email },
      { abortEarly: false }
    );

    const userUpdate = await userModel
      .findOneAndUpdate(
        { _id: user },
        {
          name,
          username,
          email,
        },
        { new: true }
      )
      .select("-password");

    if (!userUpdate) {
      return res.status(404).json({ message: "not found user" });
    }

    return res
      .status(200)
      .json({ message: "user updated successfully", user: userUpdate });
  } catch (error) {
    next(error);
  }
};

exports.editAvatar = async (req, res, next) => {
  try {
    const file = req.file;
    console.log(file);
    const user = req.user._id;
    if (!file) {
      return res.status(404).json({ message: "not found file" });
    }

    const urlAvatar = `images/avatars/${req.file.filename}`;

    const userAvatar = await userModel.findOneAndUpdate(
      { _id: user },
      {
        $set: {
          avatar: urlAvatar,
        },
      }
    );

    if (!userAvatar) {
      return res.status(404).json({ message: "not found user" });
    }

    return res.status(200).json({ massage: "avatar uploaded successfully" });
  } catch (error) {
    next(error);
  }
};

exports.editPassword = async (req, res , next) => {
  try {
    const user = req.user;
    const { password , confirmPassword } = req.body;

    await editPasswordValidator.validate({ password , confirmPassword });

    const updatePassword = await userModel.findOneAndUpdate(
      { _id: user._id },
      { password }
    );

    if (!updatePassword) {
      return res.status(422).json({ message: "password  update was faild" });
    }

    return res.status(200).json({ message: "password updated successfully" });
  } catch (error) {
    next(error);
  }
};
