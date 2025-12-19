// backend/server.js
require("dotenv").config();
const connectDB = require("./src/config/db");
const app = require("./src/app");

connectDB();
app.listen(process.env.PORT, () =>
  console.log("Server running on port", process.env.PORT)
);
