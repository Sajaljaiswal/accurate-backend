const Test = require("../models/Test");
const DoctorTest = require("../models/doctorTest");
const PanelTest = require("../models/PanelTest");

/**
 * Resolve final test price
 * Priority:
 * 1. Doctor custom price
 * 2. Panel custom price
 * 3. Default test price
 */
async function resolveTestPrice({ testId, doctorId, panelId }) {
  // 1️⃣ Doctor-specific price
  if (doctorId) {
    const doctorTest = await DoctorTest.findOne({
      doctor: doctorId,
      test: testId,
      isActive: true,
    });

    if (doctorTest && doctorTest.customPrice !== null) {
      return doctorTest.customPrice;
    }
  }

  // 2️⃣ Panel-specific price
  if (panelId) {
    const panelTest = await PanelTest.findOne({
      panel: panelId,
      test: testId,
      isActive: true,
    });

    if (panelTest && panelTest.customPrice !== null) {
      return panelTest.customPrice;
    }
  }

  // 3️⃣ Default test price
  const test = await Test.findById(testId);
  return test.price;
}

module.exports = { resolveTestPrice };

