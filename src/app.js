const express = require("express");
const path = require("path");

const app = express();

/*Body-parser*/
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));

/*Static Folders*/
app.use(express.static(path.join(__dirname, "..", "public")));

/*404 Error Handler*/
app.use((req, res) => {
  console.log("this path not found", req.path);
  return res.status(404).json({ message: "the path not found " });
});

module.exports = app;
