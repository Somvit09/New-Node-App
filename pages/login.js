const User = require("../models/userModel");
const OTP = require("../models/otpModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();

// Login function with OTP authentication
const login = async (req, res) => {
    const { email, password, phoneNumber } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ userEmail: email, userPhoneNumber: phoneNumber });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Compare the entered password with the stored hash
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Incorrect password" });
        }
        // Create and sign a JWT token for the newly registered user
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: "1h", // expires in 1 hour
        });

        // Send OTP via Twilio
        await client.messages.create({
            body: `Your otp is ${otp}. It will be valid for 5 minutes.`,
            from: twilioPhoneNumber,
            to: phoneNumberToSendOTP,
        });

        res.status(200).json({
            message: `OTP sent Successfully. otp is ${otp}. It will be valid for 5 minutes.`,
            token: token,  // include the JWT token in the response
            redirectURL: `/verify-otp?email=${email}&phoneNumber=${phoneNumber}`,
        });
    } catch (error) {
        console.log(`Failed to send OTP to the phone number ${phoneNumberToSendOTP}.`, error);
        res.status(500).json({ error: "Failed to register user" });
    }
}

// Verify OTP
const verifyOTP = async (req, res) => {
    const { phoneNumber, user_otp } = req.body;

    try {
        // Check if the OTP matches the stored OTP
        const storedOTP = await OTP.findOne({ phoneNumber: phoneNumber, otp: user_otp });
        
        if (storedOTP && storedOTP.otp === user_otp) {
            res.status(200).json({ message: "OTP verified successfully" });
        } else {
            res.status(400).json({ error: "Invalid OTP" });
        }
    } catch (err) {
        console.error("Error verifying OTP:", err);
        res.status(500).json({ error: "Error verifying OTP" });
    }
}

module.exports = {
    login, verifyOTP
}
