const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

const connectDB = () => {
    console.log('MongoDB URI:', process.env.MONGODB_URI); // Add this log to check the value
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
};

module.exports = connectDB;
