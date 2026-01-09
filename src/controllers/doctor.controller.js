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
    const {
      page = 1,
      limit = 10,
      search = "",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // 🔍 Build query
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
      ];
    }

    const [doctors, totalItems] = await Promise.all([
      Doctor.find(query)
        .sort({ name: 1 }) // alphabetical for dropdown
        .skip(skip)
        .limit(limitNum),

      Doctor.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: doctors,
      pagination: {
        totalItems,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalItems / limitNum),
      },
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
