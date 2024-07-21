const {
  createPostValidator,
  createCommentValidator,
} = require("./post.validators");
const postModel = require("../../models/Post");
const { isValidObjectId } = require("mongoose");
const hasAccessToPage = require("../../utils/hasAccessToPage");
const likeModel = require("../../models/Like");
const saveModel = require("../../models/Save");
const commentModel = require("../../models/Comment");
const fs = require("fs");
const path = require("path");

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

exports.getAll = async (req, res, next) => {
  try {
    const user = req.user;
    const posts = await postModel
      .find({})
      .populate("user", "name username avatar")
      .lean()
      .sort({ _id: -1 });

    const likes = await likeModel
      .find({ user: user._id })
      .lean()
      .populate("user", "_id")
      .populate("post", "_id");

    posts.forEach((post) => {
      if (likes.length) {
        likes.forEach((like) => {
          if (post._id.toString() === like.post._id.toString()) {
            post.hasLike = true;
          }
        });
      }
    });

    const savePosts = await saveModel
      .find({ user: user._id })
      .lean()
      .populate("user", "_id")
      .populate("post", "_id");

    posts.forEach((post) => {
      if (savePosts.length) {
        savePosts.forEach((save) => {
          if (post._id.toString() === save.post._id.toString()) {
            post.isSave = true;
          }
        });
      }
    });

    return res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

exports.like = async (req, res, next) => {
  try {
    const { postID } = req.body;
    const user = req.user;

    console.log(postID);

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

    return res
      .status(200)
      .json({ message: "deleted dislike was successfully" });
  } catch (error) {
    next(error);
  }
};

exports.savePost = async (req, res, next) => {
  try {
    const user = req.user;
    const { postID } = req.body;

    const post = await postModel.findOne({ _id: postID }).lean();

    if (!post) {
      return res.status(404).json({ message: "not found post" });
    }

    const hasAccess = await hasAccessToPage(user._id, post.user.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: "access is forbidden" });
    }

    const existSave = await saveModel.findOne({ user: user._id, post: postID });

    if (existSave) {
      return res.status(409).json({ message: "post saves already" });
    }

    const savePost = new saveModel({
      user: user._id,
      post: postID,
    });

    savePost.save();

    return res.status(201).json({ message: "post save successfully" });
  } catch (error) {
    next(error);
  }
};

exports.unsavePost = async (req, res, next) => {
  try {
    const user = req.user;
    const { postID } = req.params;

    if (!isValidObjectId(postID)) {
      return res.status(409).json({ message: "postID in invalid" });
    }

    const existSave = await saveModel.findOne({ user: user._id, post: postID });

    if (!existSave) {
      return res.status(404).json({ message: "not found save post" });
    }

    await saveModel.findOneAndDelete({ user: user._id, post: postID });

    return res.status(200).json({ message: "unsave done successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getSaves = async (req, res, next) => {
  try {
    const user = req.user;

    const saves = await saveModel
      .find({ user: user._id })
      .sort({ _id: -1 })
      .lean()
      .populate({
        path: "post",
        populate: {
          path: "user",
          model: "User",
          select: "name username avatar",
        },
      });

    const likes = await likeModel
      .find({ user: user._id })
      .lean()
      .populate("user", "_id")
      .populate("post", "_id");

    saves.forEach((save) => {
      if (likes.length) {
        likes.forEach((like) => {
          if (save.post._id.toString() === like.post._id.toString()) {
            save.post.hasLike = true;
          }
        });
      }
    });

    return res.status(200).json(saves);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const user = req.user;

    const { postID } = req.params;

    if (!isValidObjectId(postID)) {
      return res.status(409).json({ message: "the postID in invalid" });
    }

    const post = await postModel.findOne({ _id: postID, user: user._id });

    if (!post || post.user.toString() !== user._id.toString()) {
      return res.status(404).json({ message: "not found post" });
    }

    await likeModel.deleteMany({ post: postID });
    await saveModel.deleteMany({ post: postID });

    const postFilePath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "public",
      "images",
      "posts",
      post.media.filename
    );

    fs.unlinkSync(postFilePath, (error) => {
      if (error) {
        next(error);
      }
    });

    const removePost = await postModel.findOneAndDelete({ _id: postID });

    if (!removePost) {
      return res.status(404).json({ message: "post removed was faild" });
    }

    return res.status(200).json({ message: "post removed successfully" });
  } catch (error) {
    next(error);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const user = req.user;
    const { content, postID } = req.body;

    await createCommentValidator.validate({ content, postID });

    const existPost = await postModel.findOne({ _id: postID }).lean();
    if (!existPost) {
      return res.status(404).json({ message: "not found post" });
    }

    await commentModel.create({
      user: user._id,
      post: postID,
      content,
      isAnswer: 0,
    });

    return res.status(201).json({ message: "comment add successfully" });
  } catch (error) {
    next(error);
  }
};

exports.removeComment = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
