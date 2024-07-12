const { createPostValidator } = require("./post.validators");
const postModel = require("../../models/Post");

exports.create = async (req, res, next) => {
  try {
    const user = req.user._id;
    const { description, hashtags } = req.body;

    const tags = hashtags?.splite(",");

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
