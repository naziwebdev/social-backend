const hasAccessToPage = require("../../utils/hasAccessToPage");
const UserModel = require("../../models/User");
const FollowModel = require("../../models/Follow");
const postModel = require("../../models/Post");
const likeModel = require("../../models/Like");
const saveModel = require('../../models/Save')
const commentModel = require('../../models/Comment')

exports.getPage = async (req, res, next) => {
  try {
    const user = req.user;

    const { pageID } = req.params;

    const hasAccessPage = await hasAccessToPage(user._id, pageID);

    const followed = await FollowModel.findOne({
      follower: user._id,
      following: pageID,
    }).lean();

    const page = await UserModel.findOne(
      { _id: pageID },
      "name username private isVerified avatar biogeraphy"
    ).lean();

    if (!hasAccessPage) {
      return res.status(403).json({
        haveFollowed: Boolean(followed),
        hasAccessPage,
        followers: [],
        pageID,
        following: [],
        page,
      });
    }

    const posts = await postModel
      .find({ user: pageID })
      .lean()
      .populate("user", "name username avatar")
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

    const comments = await commentModel.find({}).lean().populate("user","name username avatar")



    posts.forEach(post => {
      post.postComments = []
      if(comments.length){
        comments.forEach(comment => {
          if(post._id.toString() === comment.post.toString()){
            post.postComments.push(comment)
          }
        })
      }
    })


    let followers = await FollowModel.find({ following: pageID })
      .lean()
      .populate("follower", "name username avatar");

    followers = followers.map((item) => item.follower);

    let following = await FollowModel.find({ follower: pageID })
      .lean()
      .populate("following", "name username avatar");

    following = following.map((item) => item.following);

    const isOwn = user._id.toString() === pageID;

    return res.status(200).json({
      haveFollowed: Boolean(followed),
      hasAccessPage,
      followers,
      following,
      pageID,
      page,
      isOwn,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

exports.follow = async (req, res, next) => {
  try {
    const user = req.user;
    const { pageID } = req.params;

    const existPage = await UserModel.findOne({ _id: pageID });
    if (!existPage) {
      return res.status(404).json({ message: "not found page" });
    }

    if (user._id.toString() === pageID) {
      return res.status(409).json({ message: "you can not follow yourself" });
    }

    const followAleary = await FollowModel.findOne({
      follower: user._id,
      following: pageID,
    }).lean();
    if (followAleary) {
      return res.status(409).json({ message: "you follow this page already" });
    }

    await FollowModel.create({
      follower: user._id,
      following: pageID,
    });

    return res.status(201).json({ message: "page followed successfully" });
  } catch (error) {
    next(error);
  }
};

exports.unFollow = async (req, res, next) => {
  try {
    const user = req.user;
    const { pageID } = req.params;

    const unFollowPage = await FollowModel.findOneAndDelete({
      follower: user._id,
      following: pageID,
    });

    if (!unFollowPage) {
      return res.status(404).json({ message: "you dont follow this page" });
    }
    return res.status(200).json({ message: "page unFollowed successfully" });
  } catch (error) {
    next(error);
  }
};
