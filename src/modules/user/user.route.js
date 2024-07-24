const express = require("express");
const auth = require("../../middlewares/auth");
const { multerStorage } = require("../../middlewares/uploaderConfigs");
const userController = require("./user.controller");

const upload = multerStorage("public/images/avatars");

const router = express.Router();

router.route("/edit-user").put(auth, userController.editUser);

router
  .route("/edit-avatar")
  .put(auth, upload.single("avatar"), userController.editAvatar);

router.route("/edit-password").put(auth, userController.editPassword);

module.exports = router;
