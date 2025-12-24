const DoctorTest = require("../models/doctorTest");

exports.assignDoctorTest = async (req, res) => {
  const { doctor, test, customPrice } = req.body;

  const record = await DoctorTest.create({
    doctor,
    test,
    customPrice: customPrice ?? null,
  });

  res.status(201).json({ success: true, data: record });
};

exports.getDoctorTests = async (req, res) => {
  const { doctorId } = req.params;
  const tests = await DoctorTest.find({ doctor: doctorId })
    .populate("test");
  res.json(tests);
};

exports.assignTestToDoctor = async (req, res) => {
  const { doctor, test, customPrice } = req.body;

  const record = await DoctorTest.create({
    doctor,
    test,
    customPrice,
  });

  res.status(201).json(record);
};

exports.updateDoctorTest = async (req, res) => {
  const updated = await DoctorTest.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
};

exports.toggleDoctorTestStatus = async (req, res) => {
  const record = await DoctorTest.findById(req.params.id);
  record.isActive = !record.isActive;
  await record.save();
  res.json(record);
};