const multer = require("multer");
const fs = require("fs");
const path = require("path");

module.multerStorage = (destination, validFormat = /png|jpeg|webp|jpg/) => {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destination);
    },

    filename: function (req, file, cb) {
      const unique = Date.now() * Math.floor(Math.random() * 1e9);
      const ext = path.extname(file.originalname);

      cb(null, `${unique}${ext}`);
    },
  });

  const fileFilter = function (req, file, cb) {
    if (validFormat.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("the file format is invalid"));
    }
  };

  const uploader = multer({
    storage,
    limits: {
      fileSize: 512_000_000,
    },
    fileFilter,
  });

  return uploader;
};
