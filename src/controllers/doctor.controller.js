// controllers/doctor.controller.js
const Doctor = require("../models/doctor.model");

exports.createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: doctor,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};