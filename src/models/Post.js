const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    media: {
      path: { type: String, required: true },
      filename: { type: String, required: true },
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hashtags: {
      type: [String],
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const model = mongoose.model("Post", schema);

module.exports = model;
