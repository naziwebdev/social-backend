const followModel = require("../models/Follow");
const userModel = require("../models/User");

module.exports = async (userID, pageID) => {
  try {
    if (userID.toString() === pageID) {
      return true;
    }

    const page = await userModel.findOne({ _id: pageID }).lean();

    if (!page.private) {
      return true;
    }

    const followed = await followModel
      .findOne({
        follower: userID,
        following: pageID,
      })
      .lean();

    if (!followed) {
      return false;
    }

    return true;
  } catch (error) {
    console.log(error);
  }
};
