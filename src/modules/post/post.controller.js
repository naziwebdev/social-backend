const { createPostValidator } = require("./post.validators");
const postModel = require("../../models/Post");
const { isValidObjectId } = require("mongoose");
const hasAccessToPage = require("../../utils/hasAccessToPage");
const likeModel = require("../../models/Like");

exports.create = async (req, res, next) => {
  try {
    const user = req.user._id;
    const { description, hashtags } = req.body;

    const tags = hashtags?.split(",");

    if (!req.file) {
      return res.status(404).json({ message: "please upload a file" });
    }

    await createPostValidator.validate(
      { description, hashtags },
      { abortEarly: false }
    );

    const post = new postModel({
      media: {
        filename: req.file.filename,
        path: `images/posts/${req.file.filename}`,
      },
      user,
      description,
      hashtags: tags,
    });

    await post.save();

    return res.status(201).json({ message: "post upload successfully" });
  } catch (error) {
    next(error);
  }
};

exports.like = async (req, res, next) => {
  try {
    const { postID } = req.body;
    const user = req.user;

    if (!isValidObjectId(postID)) {
      return res.status(409).json({ message: "postID isnot valid" });
    }

    const post = await postModel.findOne({ _id: postID });
    if (!post) {
      return res.status(409).json({ message: "postID isnot valid" });
    }

    const hasAccess = await hasAccessToPage(user._id, post.user.toString());
    if (!hasAccess) {
      return res.status(403).json({ message: "access to post is forbidden" });
    }

    const existLike = await likeModel
      .findOne({ user: user._id, post: postID })
      .lean();
    if (existLike) {
      return res.status(409).json({ message: "like exist already" });
    }

    const like = new likeModel({
      user: user._id,
      post,
    });

    like.save();

    if (!like) {
      return res.status(404).json({ message: "not found like" });
    }

    return res.status(201).json({ message: "post liked successfully" });
  } catch (error) {
    next(error);
  }
};

exports.dislike = async (req, res, next) => {
  try {
    const { postID } = req.body;
    const user = req.user;

    if (!isValidObjectId(postID)) {
      return res.status(409).json({ message: "postID isnot valid" });
    }

    const like = await likeModel.findOne({ user: user._id, post: postID });

    if (!like) {
      return res.status(404).json({ message: "you dont like this post" });
    }

    await likeModel.findOneAndDelete({ _id: like._id });

    return res.status(200).json({ message: "deleted dislike was successfully" });
  } catch (error) {
    next(error);
  }
};
