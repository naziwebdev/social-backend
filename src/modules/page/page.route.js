const express = require("express");
const auth = require("../../middlewares/auth");
const pageController = require("./page.controller");

const router = express.Router();

router.route("/:pageID").get(auth, pageController.getPage);
router.route("/:pageID/follow").post(auth, pageController.follow);
router.route("/:pageID/unfollow").post(auth, pageController.unFollow);

module.exports = router;
