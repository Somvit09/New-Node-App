const OTP = require('../models/otpModel')
const User = require("../models/userModel")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
require('dotenv').config()

// sending mail
const testGmail = process.env.EMAIL
const emailPassword = process.env.PASSWORD_GMAIL

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

// helper function for sending email
async function sendOTPByEmail(email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: testGmail, // Your email address
            pass: emailPassword, // Your email password (make sure to keep this secure)
        },
    })
    const mailOptions = {
        from: testGmail,
        to: email,
        subject: "Forgot Password",
        text: `Your otp for new password generation is ${otp}. It will be valid for 5 minutes.`,
    }
    await transporter.sendMail(mailOptions)
}


// request otp from email or phone number

const forgotPassword = async (req, res) => {
    const {phoneNumber, email} = req.body
    const otp = generateRandomOTP()

    try {
        // check if user exists
        user = await User.findOne({userEmail: email, userPhoneNumber: phoneNumber})
        if (!user) {
            return res.status(404).json({
                error: "User not found.",
                redirectURL: "/register",
            })
        }

        // Send OTP via Twilio
        await client.messages.create({
            body: `Your otp for new password generation is ${otp}. It will be valid for 5 minutes.`,
            from: twilioPhoneNumber,
            to: phoneNumber,
        });

        // stored the otp to the model
        await OTP.create({ phoneNumber:phoneNumber, otp:otp});

        // sending otp to email
        await sendOTPByEmail(email, otp)

        res.status(200).json({
            message: `OTP sent Successfully. It will be valid for 5 minutes.`,
            redirectURL: `/verify-otp?email=${email}&phoneNumber=${phoneNumber}`
        });

    } catch(err) {
        console.error(`Failed to send OTP to the phone number ${phoneNumber}.`, err);
        res.status(500).json({ 
            error: `Failed to send OTP. Please try again later. ${err.message}`,
        });
    }
}


// Verify OTP for Password Reset
const verifyPasswordResetOTP = async (req, res) => {
    const { phoneNumber, email, user_otp, newPassword, retypedPassword } = req.body;

    try {
        // Check if the OTP matches the stored OTP
        const storedOTP = await OTP.findOne({ phoneNumber: phoneNumber, otp: user_otp, email: email });
        
        if (storedOTP && storedOTP.otp === user_otp && newPassword === retypedPassword) {
            // OTP is valid; reset the user's password
            const saltRounds = 10;
            bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
                if (err) {
                    return res.status(500).json({ error: "Failed to reset password." });
                }
                // Update the user's password in the database
                await User.findOneAndUpdate({ userEmail: email, userPhoneNumber: phoneNumber }, { password: hash });

                res.status(200).json({ message: "Password reset successfully" });
            });
        } else {
            res.status(400).json({ 
                error: "Invalid OTP. Please verify with the correct OTP.",
            });
        }
    } catch (err) {
        console.error("Error verifying OTP:", err);
        res.status(500).json({ 
            error: `Error verifying OTP. Please try again later. ${err.message}`,
        });
    }
}

module.exports = {
    forgotPassword, verifyPasswordResetOTP
}