// backend/src/utils/jwt.js
const jwt = require("jsonwebtoken");

exports.generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
