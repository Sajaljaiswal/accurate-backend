const Patient = require("../models/patient.model");
const Test = require("../models/test.model");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");


exports.registerPatient = async (req, res) => {
  try {
    const data = req.body;
    const { gender, age, tests } = data;

    // --- 1. GENERATE IDENTIFIERS ---
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
    const processedTests = await Promise.all(
      tests.map(async (t) => {
        const masterTest = await Test.findById(t.testId);

        if (!masterTest) return t;

        const matchedRange = masterTest.referenceRanges.find(
          (r) =>
            (r.gender === gender || r.gender === "All") &&
            age >= r.ageMin &&
            age <= r.ageMax
        );

        return {
          testId: t.testId,
          name: masterTest.name,
          price: Number(t.price),
          unit: masterTest.unit,
          referenceRange: matchedRange
            ? `${matchedRange.lowRange} - ${matchedRange.highRange}`
            : "Refer to result",
          resultValue: "", // Initially empty until technician fills it
          defaultResult: masterTest.defaultResult || "",
          reportType: masterTest.defaultResult ? "text" : "range",
        };
      })
    );

    /* -------------------------------
        3️⃣ BILLING CALCULATION
    --------------------------------*/
    const grossTotal = processedTests.reduce(
      (sum, t) => sum + Number(t.price),
      0
    );
    let discountAmount =
      data.billing.discountType === "percent"
        ? (grossTotal * (data.billing.discountValue || 0)) / 100
        : Number(data.billing.discountValue || 0);

    const netAmount = Math.max(0, grossTotal - discountAmount);
    const cashReceived = Number(data.billing.cashReceived || 0);
    const dueAmount = Math.max(0, netAmount - cashReceived);

    let paymentStatus = "UNPAID";
    if (cashReceived >= netAmount && netAmount > 0) paymentStatus = "PAID";
    else if (cashReceived > 0) paymentStatus = "PARTIAL";

    /* -------------------------------
        4️⃣ SAVE PATIENT WITH CREATEDBY
    --------------------------------*/
    const patient = await Patient.create({
      ...data,
      registrationNumber,
      labNumber,
      orderId,
      tests: processedTests,
      // CHANGE: Link the logged-in user to this record
      // This assumes your auth middleware (protect/verifyToken) sets req.user
      createdBy: req.user ? req.user._id : data.createdBy,
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
      message: "Patient registered successfully",
      data: patient,
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllPatients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      search = "",
      fromDate = "",
      toDate = "",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    // 🔎 Build Query
    let query = {};

    // Search: name / mobile / lab / order
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { labNumber: { $regex: search, $options: "i" } },
        { orderId: { $regex: search, $options: "i" } },
      ];
    }

   // Date Filter (CORRECT)
if (fromDate || toDate) {
  query.createdAt = {};

  if (fromDate) {
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0); // local start of day
    query.createdAt.$gte = start;
  }

  if (toDate) {
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999); // local end of day
    query.createdAt.$lte = end;
  }
}


    const [patients, totalItems] = await Promise.all([
      Patient.find(query)
        .populate("panel", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Patient.countDocuments(query),
    ]);
    res.json({
      success: true,
      data: patients,
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



exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch and Populate
    const patient = await Patient.findById(id).populate({
      path: "tests.testId",
      select: "defaultResult", // We only need this one field from the Master Test
    });

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    // Convert to plain object to allow modifications
    const patientObj = patient.toObject();

    // 2. REVERT testId to original string logic
    // This ensures your frontend 'testId' stays exactly as it was before
    patientObj.tests = patientObj.tests.map((test) => {
      // Pull the template from the populated object
      const template = test.testId?.defaultResult || "";

      return {
        ...test,
        // We put the ID back as a string so your original logic doesn't break
        testId: test.testId?._id || test.testId,
        // We add the template as a direct field
        defaultResult: test.defaultResult || template,
      };
    });

    res.status(200).json({
      success: true,
      data: patientObj,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

// backend/controllers/patientController.js
exports.updatePatient = async (req, res) => {
  try {
    const { tests, ...otherFields } = req.body;

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    /* ---------------- UPDATE NON-TEST FIELDS SAFELY ---------------- */
    Object.keys(otherFields).forEach((key) => {
      patient[key] = otherFields[key];
    });

    /* ---------------- UPDATE TEST RESULTS SAFELY ---------------- */
    if (Array.isArray(tests)) {
      patient.tests = tests.map((t) => ({
        testId: t.testId,
        name: t.name,
        price: t.price,
        reportType: t.reportType || "range",
        defaultResult: t.defaultResult || "",
        richTextContent: t.richTextContent || "",
        resultValue: t.resultValue || "",
        unit: t.unit || "",
        referenceRange: t.referenceRange || "",
        status: t.status || "Pending",
        notes: t.notes || "",
        remarks: t.remarks || "",
        advice: t.advice || "",
        isPrinted: t.isPrinted,
      }));
    }

    await patient.save();

    return res.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error("Update patient error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
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
  const testToUpdate = patient.tests.find(
    (t) => t.testId.toString() === testId
  );
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
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
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

exports.getDailyBusinessStats = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate = today;
      endDate = today;
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },

      {
        $facet: {
          // 🧮 MAIN TOTALS
          summary: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$billing.netAmount" },
                totalPatients: { $sum: 1 },
                totalTests: { $sum: { $size: "$tests" } },
              },
            },
          ],

          // 💰 PAID vs UNPAID
          paymentSplit: [
            {
              $group: {
                _id: "$billing.paymentStatus",
                revenue: { $sum: "$billing.netAmount" },
                count: { $sum: 1 },
              },
            },
          ],

          // 📊 PANEL-WISE REVENUE
          panelWise: [
            {
              $group: {
                _id: "$panel",
                revenue: { $sum: "$billing.netAmount" },
                patients: { $sum: 1 },
              },
            },
          ],

          // ⏰ HOURLY DATA
          hourly: [
            {
              $group: {
                _id: { $hour: "$createdAt" },
                revenue: { $sum: "$billing.netAmount" },
                tests: { $sum: { $size: "$tests" } },
              },
            },
          ],

          // 📋 RECENT BOOKINGS
          recent: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
          ],
        },
      },
    ];

    const [result] = await Patient.aggregate(pipeline);

    const summary = result.summary[0] || {};
    const hourlyMap = {};

    result.hourly.forEach((h) => {
      hourlyMap[h._id] = h;
    });

    const hourlyData = Array.from({ length: 24 }, (_, h) => ({
      time: `${h}:00`,
      revenue: hourlyMap[h]?.revenue || 0,
      tests: hourlyMap[h]?.tests || 0,
    }));

    res.json({
      startDate,
      endDate,
      totalRevenue: summary.totalRevenue || 0,
      totalPatients: summary.totalPatients || 0,
      totalTests: summary.totalTests || 0,
      avgTicket:
        summary.totalPatients > 0
          ? Math.round(summary.totalRevenue / summary.totalPatients)
          : 0,

      paymentSplit: result.paymentSplit,
      panelWise: result.panelWise,
      hourlyData,
      recentBookings: result.recent,
    });
  } catch (err) {
    console.error("Business stats error:", err);
    res.status(500).json({ message: err.message });
  }
};


exports.exportBusinessExcel = async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Business Report");

  sheet.columns = [
    { header: "Panel", key: "panel", width: 25 },
    { header: "Revenue", key: "revenue", width: 15 },
    { header: "Patients", key: "patients", width: 15 },
  ];

  req.body.panelWise.forEach((p) => {
    sheet.addRow({
      panel: p._id,
      revenue: p.revenue,
      patients: p.patients,
    });
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=report.xlsx");

  await workbook.xlsx.write(res);
  res.end();
};



exports.exportBusinessPDF = (req, res) => {
  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

  doc.pipe(res);

  doc.fontSize(18).text("Business Report", { align: "center" });
  doc.moveDown();

  req.body.panelWise.forEach((p) => {
    doc.fontSize(12).text(
      `${p._id} : ₹${p.revenue} (${p.patients} patients)`
    );
  });

  doc.end();
};

