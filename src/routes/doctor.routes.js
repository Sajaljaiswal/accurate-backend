// routes/doctor.routes.js
const express = require("express");
const router = express.Router();
const { createDoctor, getAllDoctor } = require("../controllers/doctor.controller");

router.post("/", createDoctor);
router.get("/", getAllDoctor);
module.exports = router;
