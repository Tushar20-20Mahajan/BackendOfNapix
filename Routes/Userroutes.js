const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const { hashPassword } = require('../Utils/password');
const router = express.Router();
const { authenticateLogisticsHead } = require('../Utils/authmiddleware');

// Sign Up
router.post('/signup/logistics-head', async (req, res) => {
    const { name, email, phoneNumber, password, companyName } = req.body;
    try {
        // Validate input
        if (!name || !email || !phoneNumber || !password || !companyName) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = new User({
            name,
            email,
            phoneNumber,
            password: hashedPassword,
            role: 'logistics_head',
            companyName,
        });

        await newUser.save();
        res.status(201).json({ message: 'Logistics user created' });
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route to get user details
router.get('/profile', authenticateLogisticsHead, async (req, res) => {
    try {
        const user = await User.findById(req.user._id); // Use _id from the token
        if (!user) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            companyName: user.companyName
        });
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
