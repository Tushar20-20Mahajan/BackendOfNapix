const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    companyName: { type: String, required: true },
    role: { type: String, default: 'logistics_head' }, // Only logistics team members can sign up
    drivers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Driver' }], // Reference to Driver model
    vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }], // Reference to Vehicle model
    routes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }] // Reference to Route model
}, {
    timestamps: true // Automatically manage createdAt and updatedAt fields
});

module.exports = mongoose.model('User', UserSchema);
