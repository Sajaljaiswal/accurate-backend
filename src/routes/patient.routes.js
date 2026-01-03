const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patient.controller");
const { registerPatient, getAllPatients, getTodayPatients, updatePatient, settleBilling, getDailyBusinessStats } = require("../controllers/patient.controller");
router.get("/business-stats", getDailyBusinessStats);

router.post("/register", registerPatient);
router.get("/", getAllPatients);
router.get("/today/count", getTodayPatients);
router.put("/:id", updatePatient);
router.patch("/:id/settle", settleBilling);
router.get("/:id", patientController.getPatientById);
router.put("/:id/results", patientController.updateBulkResults);

module.exports = router;
