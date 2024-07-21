const yup = require("yup");

exports.createPostValidator = yup.object({
  description: yup
    .string()
    .max(2200, "Description cannot be more than 2200 chars long !!")
    .required("please write the description"),
});

exports.createCommentValidator = yup.object({
  content: yup
    .string()
    .max(1600, "Description cannot be more than 2200 chars long !!")
    .required("please write the description"),

  postID: yup
    .string()
    .required("please enter postID")
    .matches(/^[0-9a-fA-F]{24}$/),
});
