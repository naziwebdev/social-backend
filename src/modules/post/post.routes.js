const express = require("express");
const auth = require("../../middlewares/auth");
const postController = require("./post.controller");
const AccountVerify = require("../../middlewares/AccountVerify");
const { multerStorage } = require("../../middlewares/uploaderConfigs");

const upload = multerStorage(
  "public/images/posts",
  /png|jpg|jpeg|webp|mp4|mkv/
);

const router = express.Router();

router.route("/").post(auth, AccountVerify,upload.single('media') ,postController.create);


module.exports = router;
