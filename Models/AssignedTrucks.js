const mongoose = require('mongoose');

const AssignedTruckSchema = new mongoose.Schema({
    vehicleNumber: { type: String, required: true },
});

module.exports = mongoose.model('AssignedTruck', AssignedTruckSchema);
