const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["SUPERADMIN", "STAFF", "LABORATORY", "ACCOUNTS"],
    default: "STAFF",
  },
  isActive: { type: Boolean, default: true },

  // ✅ logout tracking
  lastLoggedOutAt: {
    type: Date,
    default: null,
  },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userSchema);
