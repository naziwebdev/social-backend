const express = require("express");
const auth = require("../../middlewares/auth");
const pageController = require("./page.controller");

const router = express.Router();

router.report("/:pageID").get(auth, pageController.getPage);
router.post("/:pageID/follow").post(auth, pageController.follow);
router.post("/:pageID/unfollow").post(auth, pageController.unFollow);

module.exports = router;
