const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
    name: String,
    mobileNumber: String,
    email: { type: String, unique: true },
    password: String,
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User model
    passwordResetRequired: { type: Boolean, default: true }
});

module.exports = mongoose.model('Driver', DriverSchema);
