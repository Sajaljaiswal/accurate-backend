const User = require("../models/user.model"); // Check if this matches your filename exactly (User.js vs user.model.js)
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Find user and explicitly include password if it's "select: false" in schema
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Compare passwords
    // Ensure "password" is plain text from req.body and "user.password" is the hash from DB
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Check if user is active (Optional but recommended)
    if (user.isActive === false) {
      return res.status(403).json({ message: "Your account is deactivated" });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Ensure values are trimmed to avoid accidental spaces causing login failure
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Pass the PLAIN password here. 
    // Your UserSchema.pre('save') hook will hash it once.
    const newUser = new User({
      username: cleanUsername,
      password: cleanPassword, 
      role: role || "STAFF"
    });

    await newUser.save();

    res.status(201).json({ 
      message: "User created successfully", 
      user: { username: newUser.username, role: newUser.role } 
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ username: 1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; 
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "New password cannot be the same as the old password" });
    }

    user.password = newPassword.trim();
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Password reset failed", error: error.message });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const { username, role, isActive } = req.body;
    const { id } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, role, isActive },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params; 
    console.log("Attempting to delete ID:", id);
    if (req.user && id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};