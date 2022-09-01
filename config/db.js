const mongoose = require("mongoose");

require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATA_BASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("DB CONNECTED OK");
  } catch (error) {
    console.log("there is an error", error);
    procces.exit(1); // stop the app
  }
};

module.exports = connectDB;
