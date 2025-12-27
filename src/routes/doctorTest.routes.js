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
router.post("/", assignDoctorTest);         
router.get("/doctor/:doctorId", getDoctorTests);   
router.put("/:id", updateDoctorTest);      
router.patch("/:id/toggle", toggleDoctorTest);

module.exports = router;
