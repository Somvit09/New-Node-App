// model for otp creation and validation

const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phoneNumber: String,
    otp: String,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '5m' // otp expired in 5 minutes
    }
});

module.exports = mongoose.model('OTP', otpSchema);