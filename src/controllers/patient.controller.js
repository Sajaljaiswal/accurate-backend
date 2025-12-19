const Patient = require("../models/patient.model");

exports.registerPatient = async (req, res) => {
  try {
    const data = req.body;

    // 🔐 Backend billing safety (recommended)
    const grossTotal = data.tests.reduce(
      (sum, t) => sum + Number(t.price),
      0
    );

    let discountAmount = 0;
    if (data.billing.discountType === "percent") {
      discountAmount = (grossTotal * data.billing.discountValue) / 100;
    } else {
      discountAmount = data.billing.discountValue;
    }

    const netAmount = grossTotal - discountAmount;

    const patient = await Patient.create({
      ...data,
      billing: {
        ...data.billing,
        grossTotal,
        discountAmount,
        netAmount,
      },
    });

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      data: patient,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .sort({ createdAt: -1 }); // latest first

    res.json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
