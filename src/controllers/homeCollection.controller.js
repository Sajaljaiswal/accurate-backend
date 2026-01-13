const HomeCollection = require('../models/HomeCollection.model'); // Adjust path as needed

exports.createHomeCollections = async (req, res) => {
  try {
    const { fullName, phone, address, date } = req.body;

    // 1. Basic Validation
    if (!fullName || !phone || !address || !date) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: fullName, phone, address, and date.",
      });
    }

    // 2. Create the record
    const newRequest = await HomeCollection.create({
      fullName,
      phone,
      address,
      date,
    });

    // 3. Send Success Response
    res.status(201).json({
      success: true,
      message: "Home collection request saved successfully!",
      data: newRequest,
    });

  } catch (error) {
    console.error("Error in createHomeCollection:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Could not save request.",
      error: error.message,
    });
  }
};

exports.getHomeCollections = async (req, res) => {
  try {
    const requests = await HomeCollection.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching requests",
      error: error.message,
    });
  }
};

// @desc    Update only the status of a request
// @route   PATCH /api/home-collections/:id
// @access  Private
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Validate status against allowed values
    const allowedStatuses = ["Pending", "Called", "Picked Up", "Cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value provided.",
      });
    }

    // 2. Find and update
    const updatedRequest = await HomeCollection.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    await HomeCollection.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Request deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};