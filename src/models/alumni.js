const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const alumniSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Added for authentication
  branch: { type: String, required: true },
  currentWorkingDomain: { type: String },
  description: {
    small: { type: String },
    large: { type: String },
  },
  passedOutYear: { type: Number, required: true },
  experiences: { type: [String], default: [] },
}, { timestamps: true });

// Hash password before saving
alumniSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
alumniSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Alumni', alumniSchema);
