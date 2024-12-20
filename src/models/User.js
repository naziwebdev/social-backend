const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
    },
    biogeraphy: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: true,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
    private: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

schema.pre("save", async function (next) {
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});



schema.pre('findOneAndUpdate', async function (next) {
  try {
    // Access the query and update objects
    const query = this.getQuery(); // The query object
    const update = this.getUpdate(); // The update object


    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }

    next();
  } catch (error) {
    next(error);
  }
}
)
const model = mongoose.model("User", schema);

module.exports = model;
