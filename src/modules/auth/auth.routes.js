const express = require("express");
const authController = require("./auth.controller");
const auth = require('../../middlewares/auth')

const router = express.Router();

router.route("/register").post(authController.register);
router.route("/login").post(authController.login);
router.route('/me').get(auth,authController.getMe)

module.exports = router;
