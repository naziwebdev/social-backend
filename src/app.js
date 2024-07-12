const express = require("express");
const path = require("path");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const authRouter = require("./modules/auth/auth.routes");
const postRouter = require("./modules/post/post.routes");
const pageRouter = require("./modules/page/page.route");

const { setHeaders } = require("./middlewares/headers");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

/*Cors Policy*/
app.use(setHeaders);

/*Body-parser*/
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));

/*Cookie Parser*/
app.use(cookieParser());

/*Static Folders*/
app.use(express.static(path.join(__dirname, "..", "public")));

/*Routes*/
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/page", pageRouter);

/*404 Error Handler*/
app.use((req, res) => {
  console.log("this path not found", req.path);
  return res.status(404).json({ message: "the path not found " });
});

module.exports = app;
