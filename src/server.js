const mongoose = require("mongoose");
const app = require("./app");
const dotenv = require("dotenv");

const isDevelopmentMode = process.env.NODE_ENV === "development";
if (isDevelopmentMode) {
  dotenv.config();
}

const connectToDB = async () => {
  try {
    
    await mongoose.connect('mongodb://127.0.0.1:27017/social');
    console.log(`mongodb connected successfully : ${mongoose.connection.host}`);
  } catch (error) {
    console.log("mongodb connection faild", error);
    process.exit(1);
  }
};

const sevrverRunning = () => {
  const port = +process.env.PORT || 4001;

  app.listen(port, () => {
    console.log(`Sever running on port ${port}`);
  });
};

const run = async () => {
  sevrverRunning();
  await connectToDB();
};

run();
