// commuteModel.js
const mongoose = require('mongoose');

const commuteSchema = new mongoose.Schema({
    startLocation: {
        type: String,
        required: true
    },
    endLocation: {
        type: String,
        required: true
    },
    distance: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Commute = mongoose.model('Commute', commuteSchema);
module.exports = Commute;
