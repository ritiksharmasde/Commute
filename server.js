const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // CORS for frontend communication
const morgan = require('morgan'); // Logging HTTP requests
require('dotenv').config(); // Load environment variables

const authRoutes = require('./authRoutes');
const commuteRoutes = require('./commuteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/commutePortal';

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json()); // No need for bodyParser.json() in Express 4.16+

// MongoDB Connection with Async/Await
async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB connected successfully');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
    }
}
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/commute', commuteRoutes);

// Root Route (for testing)
app.get('/', (req, res) => {
    res.send('Welcome to the Daily Commute Portal API 🚍');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Graceful Shutdown on Exit
process.on('SIGINT', async () => {
    console.log('\n🛑 Server shutting down...');
    await mongoose.connection.close();
    console.log('✅ MongoDB disconnected');
    process.exit(0);
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
