const express = require("express");
const router = express.Router();
const { registerPatient, getAllPatients, getTodayPatients } = require("../controllers/patient.controller");

router.post("/register", registerPatient);
router.get("/", getAllPatients);
router.get("/today/count", getTodayPatients);

module.exports = router;
