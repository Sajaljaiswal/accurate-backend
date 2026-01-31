const mongoose = require("mongoose");

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_LIVE);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed");
    process.exit(1);
  }
};
