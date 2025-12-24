// backend/src/routes/auth.routes.js
const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const { login, register } = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { getAllUsers } = require("../controllers/auth.controller"); // Import controller

router.post("/login", login);

router.get("/admin", auth, role("SUPERADMIN"), (_, res) =>
  res.json({ message: "Admin Access" })
);

router.get("/accounts", auth, role("ACCOUNTS", "SUPERADMIN"), (_, res) =>
  res.json({ message: "Accounts Access" })
);

router.get("/users", auth, role("SUPERADMIN"), getAllUsers);

router.post("/register", auth, role("SUPERADMIN"), register);
module.exports = router;
