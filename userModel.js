const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10; // Define salt rounds for consistency

// Embedded Commute History Schema
const commuteSchema = new mongoose.Schema({
    start: { type: String, required: true },
    end: { type: String, required: true },
    distance: { type: Number, required: true }, // Added distance
    duration: { type: String, required: true }, // Added duration
    date: { type: Date, default: Date.now }
});

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true // Ensures faster lookups
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    commuteHistory: [commuteSchema] // Commute history as an array
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
        next();
    } catch (err) {
        next(err);
    }
});

// Compare password method for authentication
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
