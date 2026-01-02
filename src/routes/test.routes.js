const express = require("express");
const router = express.Router();

const {
  addTest,
  getAllTests,
  deleteTest,
  updateTest
} = require("../controllers/test.controller");


router.post("/", addTest);
router.get("/", getAllTests);
router.delete("/:id", deleteTest);
router.put("/:id", updateTest);


module.exports = router;