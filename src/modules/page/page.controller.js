const hasAccessToPage = require("../../utils/hasAccessToPage");
const UserModel = require("../../models/User");
const FollowModel = require("../../models/Follow");

exports.getPage = async (req, res, next) => {
  try {
    const user = req.user;
    const { pageID } = req.params;

    const hasAccessPage = await hasAccessToPage(user._id, pageID);

    const followed = await FollowModel.findOne({
      follower: user._id,
      following: pageID,
    }).lean();

    if (!hasAccessPage) {
      return res
        .status(403)
        .json({ hasAccess: Boolean(followed), followers: [], pageID });
    }

    let followers = await FollowModel.find({ following: pageID })
      .lean()
      .populate("follower", "name username");

    followers = followers.map((item) => item.follower);

    return res
      .status(200)
      .json({ hasAccess: Boolean(followed), followers, pageID });
  } catch (error) {
    next(error);
  }
};

exports.follow = async (req, res, next) => {
  try {

    




  } catch (error) {
    next(error);
  }
};

exports.unFollow = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
