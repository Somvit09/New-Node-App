const OTP = require('../models/otpModel')
const User = require("../models/userModel")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
require('dotenv').config()

// for otp
const twilio = require('twilio');
const twilioAccountSid = process.env.YOUR_TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.YOUR_TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.YOUR_TWILIO_PHONE_NUMBER;

// initializing the Twilio client
const client = twilio(twilioAccountSid, twilioAuthToken);

// Helper function to generate a random OTP
function generateRandomOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register function
const register = async (req, res) => {
    const phoneNumberToSendOTP = req.body.phoneNumber;
    const email = req.body.email;
    const { isMerchant, isCustomer, password, retyppedPassword } = req.body;
    const otp = generateRandomOTP();

    // Check if passwords match
    if (password !== retyppedPassword) {
        return res.status(401).json({ 
            message: "Password and retyped password don't match.",
            redirectURL: `/register?email=${email}&phoneNumber=${phoneNumberToSendOTP}`
        });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({
            userEmail: email,
            userPhoneNumber: phoneNumberToSendOTP,
        });

        if (existingUser) {
            console.log("User already exists");
            return res.status(409).json({ 
                message: "User already exists",
                redirectURL: '/login',
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user with hashed password
        const newUser = await User.create({
            userEmail: email,
            userPhoneNumber: phoneNumberToSendOTP,
            isMerchant: isMerchant,
            isCustomer: isCustomer,
            password: hashedPassword
        });

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

        // stored the otp to the model
        await OTP.create({ phoneNumber:phoneNumberToSendOTP, otp:otp});

        res.status(201).json({
            message: `OTP sent Successfully. otp is ${otp}. It will be valid for 5 minutes.`,
            token: token,  // include the JWT token in the response
            redirectURL: `/verify-otp?email=${email}&phoneNumber=${phoneNumberToSendOTP}`,
        });
    } catch (error) {
        console.log(`Failed to send OTP to the phone number ${phoneNumberToSendOTP}.`, error.message);
        res.status(500).json({ 
            error: `Failed to register user. ${error.message}`,
            redirectURL: `/register?email=${email}&phoneNumber=${phoneNumberToSendOTP}`
        });
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
            res.status(400).json({ 
                error: "Invalid OTP",
                redirectURL: `/register?phoneNumber=${phoneNumber}&otp=${user_otp}`
            });
        }
    } catch (err) {
        console.error("Error verifying OTP:", err);
        res.status(500).json({ error: "Error verifying OTP" });
    }
}

module.exports = {
    register,
    verifyOTP
}
