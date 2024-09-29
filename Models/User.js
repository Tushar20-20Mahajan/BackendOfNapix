const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phoneNumber: String,
    password: String,
    companyName: String,
    role: { type: String, default: 'logistics_head' }, // Include role for user
    drivers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Driver' }], // Reference to Driver model
    vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }], // Reference to Vehicle model
    routes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }] // Reference to Route model
});

module.exports = mongoose.model('User', UserSchema);
