const express = require("express");
const router = express.Router();
const { registerPatient, getAllPatients } = require("../controllers/patient.controller");

router.post("/register", registerPatient);
router.get("/", getAllPatients);
module.exports = router;
