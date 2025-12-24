const express = require("express");
const router = express.Router();
const {
  
  updateDoctorTest,
  toggleDoctorTest,
} = require("../controllers/doctor.controller");
const {
  getDoctorTests,
  assignDoctorTest,
} = require("../controllers/doctorTest.controller");
router.post("/", assignDoctorTest);          // POST /api/doctor-tests
router.get("/doctor/:doctorId", getDoctorTests);    // GET  /api/doctor-tests/:doctorId
router.put("/:id", updateDoctorTest);        // PUT  /api/doctor-tests/:id
router.patch("/:id/toggle", toggleDoctorTest);

module.exports = router;
