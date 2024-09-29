const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    vehicleNumber: { type: String, unique: true, required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to User model
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
