const express = require("express");
const router = express.Router();

const {
  registerPanel,
  getAllPanels,
} = require("../controllers/panel.controller");

router.post("/register", registerPanel);
router.get("/", getAllPanels);


module.exports = router;
