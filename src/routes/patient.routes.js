const express = require("express");
const router = express.Router();
const { registerPatient, getAllPatients, getTodayPatients, updatePatient, settleBilling } = require("../controllers/patient.controller");

router.post("/register", registerPatient);
router.get("/", getAllPatients);
router.get("/today/count", getTodayPatients);
router.put("/:id", updatePatient);
router.patch("/:id/settle", settleBilling);

module.exports = router;
