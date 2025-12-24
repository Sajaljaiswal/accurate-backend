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

// POST /api/doctor-tests
exports.assignTestToDoctor = async (req, res) => {
  const { doctor, test, customPrice } = req.body;

  const docTest = await DoctorTest.create({
    doctor,
    test,
    customPrice: customPrice ?? null,
  });

  res.json({ success: true, data: docTest });
};


// POST /api/doctor-tests/bulk
exports.assignMultipleTests = async (req, res) => {
  const { doctor, tests } = req.body;
  // tests = [{ test, customPrice }]

  const docs = tests.map((t) => ({
    doctor,
    test: t.test,
    customPrice: t.customPrice ?? null,
  }));

  await DoctorTest.insertMany(docs, { ordered: false });

  res.json({ success: true });
};

// PATCH /doctor-tests/:id/toggle
exports.toggleDoctorTest = async (req, res) => {
  const doc = await DoctorTest.findById(req.params.id);
  doc.isActive = !doc.isActive;
  await doc.save();
  res.json(doc);
};

// PUT /doctor-tests/:id
exports.updateDoctorTest = async (req, res) => {
  const { customPrice } = req.body;

  const doc = await DoctorTest.findByIdAndUpdate(
    req.params.id,
    { customPrice },
    { new: true }
  );

  res.json(doc);
};
