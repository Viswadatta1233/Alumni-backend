const Alumni = require('../models/alumni');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });
};

// Signup Controller
exports.signup = async (req, res) => {
  try {
    const { name, email, password, branch, currentWorkingDomain, description, passedOutYear, experiences } = req.body;

    // Check if alumni already exists
    const alumniExists = await Alumni.findOne({ email });
    if (alumniExists) return res.status(400).json({ message: 'Alumni already registered' });

    // Create new alumni
    const newAlumni = new Alumni({
      name,
      email,
      password,
      branch,
      currentWorkingDomain,
      description,
      passedOutYear,
      experiences,
    });

    const savedAlumni = await newAlumni.save();

    // Generate token
    const token = generateToken(savedAlumni._id);

    // Set cookie
    res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    res.status(201).json({ message: 'Signup successful', alumni: savedAlumni, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if alumni exists
    const alumni = await Alumni.findOne({ email });
    if (!alumni) return res.status(404).json({ message: 'Invalid email or password' });

    // Verify password
    const isMatch = await alumni.matchPassword(password);
    if (!isMatch) return res.status(404).json({ message: 'Invalid email or password' });

    // Generate token
    const token = generateToken(alumni._id);

    // Set cookie
    res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    res.status(200).json({ message: 'Login successful', alumni, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout Controller
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};
