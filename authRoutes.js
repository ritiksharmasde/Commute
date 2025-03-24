const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('./userModel');
const Commute = require('./commuteModel');
const authMiddleware = require('./authMiddleware');

dotenv.config(); // Load environment variables

// Registration Route
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Secure password hashing
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add Commute History Route (User Model)
router.post('/commute-history', authMiddleware, async (req, res) => {
    const { start, end } = req.body;

    if (!start || !end) {
        return res.status(400).json({ message: 'Start and end locations are required.' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.commuteHistory.push({ start, end, date: new Date() });
        await user.save();

        res.status(200).json({ message: 'Commute history added successfully!', history: user.commuteHistory });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Save Commute History to MongoDB (Commute Model)
router.post('/save-commute', authMiddleware, async (req, res) => {
    const { startLocation, endLocation, distance, duration } = req.body;

    if (!startLocation || !endLocation || !distance || !duration) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const commute = new Commute({
            startLocation,
            endLocation,
            distance,
            duration,
            userId: req.user.id
        });

        await commute.save();
        res.status(201).json({ message: 'Commute saved successfully.', commute });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save commute history.', error: error.message });
    }
});

// Get Commute History
router.get('/commute-history', authMiddleware, async (req, res) => {
    try {
        const commutes = await Commute.find({ userId: req.user.id });

        if (!commutes.length) {
            return res.status(404).json({ message: 'No commute history found.' });
        }

        res.status(200).json({ history: commutes });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
