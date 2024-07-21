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

router
  .route("/")
  .get(auth,postController.getAll)
  .post(auth, AccountVerify, upload.single("media"), postController.create);

router.route("/like").post(auth, postController.like);
router.route("/dislike").post(auth, postController.dislike);

router.route("/save").post(auth, postController.savePost);
router.route("/:postID/unsave").delete(auth, postController.unsavePost);

module.exports = router;
