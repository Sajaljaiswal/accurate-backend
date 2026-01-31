require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/user.model");

(async () => {
  await mongoose.connect(process.env.MONGO_URI_LIVE);

  const admin = await User.create({
    username: "sajal",
    password: "123",
    role: "SUPERADMIN",
  });

  console.log("SUPERADMIN CREATED:", admin.username);
  process.exit();
})();
