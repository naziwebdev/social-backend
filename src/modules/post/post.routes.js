const express = require("express");
const auth = require("../../middlewares/auth");
const postController = require("./post.controller");

const router = express.Router();

router.route("/").post(auth, postController.create);

module.exports = router;
