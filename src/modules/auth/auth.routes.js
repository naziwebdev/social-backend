const express = require("express");
const authController = require("./auth.controller");
const auth = require("../../middlewares/auth");

const router = express.Router();

router.route("/register").post(authController.register);
router.route("/login").post(authController.login);
router.route("/me").get(auth, authController.getMe);
router.route("/refresh").post(authController.refreshToken);
router.route("/forget-password").post(authController.forgetPassword);
router.route("/reset-password").post(authController.resetPassword);

module.exports = router;
