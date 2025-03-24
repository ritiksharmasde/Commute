const express = require('express');
const router = express.Router();
const Commute = require('./commuteModel'); // Commute model
const authMiddleware = require('./authMiddleware'); // JWT middleware

// Save Commute History Route
router.post('/save', authMiddleware, async (req, res) => {
    const { startLocation, endLocation, distance, duration } = req.body;

    if (!startLocation || !endLocation || !distance || !duration) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const commute = new Commute({
            userId: req.user.id, // Use ID from JWT
            startLocation,
            endLocation,
            distance,
            duration
        });

        await commute.save();
        res.status(201).json({ message: 'Commute saved successfully.', commute });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save commute history.', error: error.message });
    }
});

// Fetch Commute History (Authenticated User Only)
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const history = await Commute.find({ userId: req.user.id }) // Fetch for logged-in user
            .sort({ date: -1 });

        if (!history.length) {
            return res.status(404).json({ message: 'No commute history found.' });
        }

        res.status(200).json({ history });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch history.', error: error.message });
    }
});

module.exports = router;
