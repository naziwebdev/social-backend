module.exports = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.isVerified) {
      return res.status(403).json({ message: "the account doese not verify" });
    }

    next();
  } catch (error) {
    next(error);
  }
};
