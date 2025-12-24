// backend/src/app.js
const express = require("express");
const cors = require("cors");
const doctorTestRoutes = require("./routes/doctorTest.routes"); // ✅ IMPORT

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/patients", require("./routes/patient.routes"));
app.use("/api/panels", require("./routes/panel.routes"));
app.use("/api/doctor", require("./routes/doctor.routes"));
app.use("/api/lab/tests", require("./routes/test.routes"));
// ✅ Register route
app.use("/api/doctorTests", doctorTestRoutes);

module.exports = app;
