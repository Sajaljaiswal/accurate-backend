const Patient = require("../models/patient.model");
const Test = require("../models/test.model"); 

exports.registerPatient = async (req, res) => {
  try {
    const data = req.body;
    const { gender, age, tests } = data;

    /* -------------------------------
        1️⃣ GENERATE IDS (Lab No, Reg No)
    --------------------------------*/
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const lastPatient = await Patient.findOne({})
      .sort({ createdAt: -1 })
      .select("registrationNumber");

    let nextNumber = 1;
    if (lastPatient?.registrationNumber) {
      nextNumber = parseInt(lastPatient.registrationNumber, 10) + 1;
    }
    const registrationNumber = nextNumber.toString().padStart(3, "0");
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const labNumber = `LAB-${todayStr}-${registrationNumber}`;
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    /* -------------------------------------------
        2️⃣ SNAPSHOT TEST DATA (Reference Ranges)
    --------------------------------------------*/
    // We process the incoming tests to attach clinical metadata from the Master DB
    const processedTests = await Promise.all(tests.map(async (t) => {
      const masterTest = await Test.findById(t.testId);
      
      if (!masterTest) return t; // Fallback if test not found

      // Find the specific reference range based on patient gender and age
      const matchedRange = masterTest.referenceRanges.find(r => 
        (r.gender === gender || r.gender === 'All') && 
        (age >= r.ageMin && age <= r.ageMax)
      );

      return {
        testId: t.testId,
        name: masterTest.name,
        price: Number(t.price),
        unit: masterTest.unit, // Snapshot the unit
        // Snapshot the range as a string for easy reporting
        referenceRange: matchedRange 
          ? `${matchedRange.lowRange} - ${matchedRange.highRange}` 
          : "Refer to result",
        resultValue: "" // Initially empty until technician fills it
      };
    }));

    /* -------------------------------
        3️⃣ BILLING CALCULATION
    --------------------------------*/
    const grossTotal = processedTests.reduce((sum, t) => sum + Number(t.price), 0);
    let discountAmount = data.billing.discountType === "percent"
      ? (grossTotal * (data.billing.discountValue || 0)) / 100
      : Number(data.billing.discountValue || 0);

    const netAmount = Math.max(0, grossTotal - discountAmount);
    const cashReceived = Number(data.billing.cashReceived || 0);
    const dueAmount = Math.max(0, netAmount - cashReceived);

    let paymentStatus = "UNPAID";
    if (cashReceived >= netAmount && netAmount > 0) paymentStatus = "PAID";
    else if (cashReceived > 0) paymentStatus = "PARTIAL";

    /* -------------------------------
        4️⃣ SAVE PATIENT WITH TESTS
    --------------------------------*/
    const patient = await Patient.create({
      ...data,
      registrationNumber,
      labNumber,
      orderId,
      tests: processedTests,
      billing: {
        ...data.billing,
        grossTotal,
        discountAmount,
        netAmount,
        cashReceived,
        dueAmount,
        paymentStatus,
      },
    });

    res.status(201).json({
      success: true,
      message: "Patient registered with snapshots",
      data: patient,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, fromDate, toDate } = req.query;

    const skip = (page - 1) * limit;

    const query = {};

    // 🔍 Search (name / mobile / lab / order)
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { labNumber: { $regex: search, $options: "i" } },
        { orderId: { $regex: search, $options: "i" } },
      ];
    }

    // 📅 Date filter
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate + "T23:59:59");
    }

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .populate("panel", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Patient.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: patients,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTodayPatients = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const count = await Patient.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    res.json({
      success: true,
      count,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updatePatient = async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json({ success: true, data: patient });
};

exports.settleBilling = async (req, res) => {
  const { cashReceived, dueAmount, paymentStatus } = req.body;

  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    {
      "billing.cashReceived": cashReceived,
      "billing.dueAmount": dueAmount,
      "billing.paymentStatus": paymentStatus,
    },
    { new: true }
  );

  res.json({ success: true, data: patient });
};

// PUT /api/patients/:id/results
exports.updateTestResults = async (req, res) => {
  const { patientId } = req.params;
  const { testId, resultValue } = req.body; 

  const patient = await Patient.findById(patientId);
  
  // Find the specific test in the patient's array and update its value
  const testToUpdate = patient.tests.find(t => t.testId.toString() === testId);
  if (testToUpdate) {
    testToUpdate.resultValue = resultValue;
    testToUpdate.status = "Authorized";
  }

  await patient.save();
  res.json({ message: "Result saved" });
};

// backend/src/controllers/patient.controller.js

exports.updateBulkResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { tests } = req.body; // Array of tests with new resultValues

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    // Update the resultValue for each matching testId
    tests.forEach((incomingTest) => {
      const testIndex = patient.tests.findIndex(
        (t) => t.testId.toString() === incomingTest.testId.toString()
      );

      if (testIndex !== -1) {
        patient.tests[testIndex].resultValue = incomingTest.resultValue;
        // Optionally update status to authorized since result is entered
        patient.tests[testIndex].status = "Authorized"; 
      }
    });

    await patient.save();

    res.json({
      success: true,
      message: "All test results updated successfully",
      data: patient.tests,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.json({
      success: true,
      data: patient,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error: " + err.message,
    });
  }
};