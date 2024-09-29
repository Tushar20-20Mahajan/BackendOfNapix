const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const RouteSchema = new mongoose.Schema({
    vehicleNumber: { type: String, required: true },
    driverName: { type: String, required: true },
    fromLocation: { type: String, required: true },
    toLocation: { type: String, required: true },
    departureDetails: {
        departureTime: { type: Date, required: true },
    },
    status: {
        type: String,
        default: 'scheduled',
        enum: ['scheduled', 'driving safely', 'active alerts'],
    },
    messages: [MessageSchema], // Use MessageSchema for messages
    assignedTruck: { type: mongoose.Schema.Types.ObjectId, ref: 'AssignedTruck' }, // Reference to AssignedTruck model
    driverPhoneNumber: String, // Add driver phone number
    logisticsHead: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to User model
});

module.exports = mongoose.model('Route', RouteSchema);
