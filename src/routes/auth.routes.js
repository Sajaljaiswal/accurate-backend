// backend/src/routes/auth.routes.js
const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");
const { login } = require("../controllers/auth.controller");

router.post("/login", login);

router.get("/admin", auth, role("SUPERADMIN"), (_, res) =>
  res.json({ message: "Admin Access" })
);

router.get("/accounts", auth, role("ACCOUNTS", "SUPERADMIN"), (_, res) =>
  res.json({ message: "Accounts Access" })
);

module.exports = router;
