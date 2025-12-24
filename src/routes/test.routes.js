const express = require("express");
const router = express.Router();

const {
  addTest,
  getAllTests,
} = require("../controllers/test.controller");


router.post("/", addTest);
router.get("/", getAllTests);


module.exports = router;