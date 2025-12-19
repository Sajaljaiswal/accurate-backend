// backend/src/models/user.model.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["SUPERADMIN", "STAFF", "LABORATORY", "ACCOUNTS"],
    default: "STAFF",
  },
  isActive: { type: Boolean, default: true },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userSchema);
