exports.errorHandler = (error, req, res, next) => {
  const status = error.statusCode || 500;
  let message = error.message || "Server Error";
  const data = error.data;

  //* making errors array
  const errorArr = [];
  if (error.errors) {
    error.errors.forEach((e) => {
      errorArr.push({
        message: e,
      });
    });
  }

  res.status(status).json({ message, data });
  console.log("<<= ERROR HANDLER =>>");
  console.log(error);
  console.log("<<= END OF ERROR =>>");
};
