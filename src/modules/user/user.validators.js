const yup = require("yup");

exports.editUserValidator = yup.object({
  username: yup
    .string()
    .min(3, "this field must be at least 3 chars")
    .optional(),
  email: yup.string().email("email format in incorrect").optional(),
  name: yup.string().min(3, "this field must be at least 3 chars").optional(),
 
});
