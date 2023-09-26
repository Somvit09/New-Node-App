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
    const { phoneNumber, email } = req.body
    const otp = generateRandomOTP()

    try {
        // check if user exists
        user = await User.findOne({ userEmail: email, userPhoneNumber: phoneNumber })
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
        await OTP.create({ phoneNumber: phoneNumber, otp: otp });

        // sending otp to email
        await sendOTPByEmail(email, otp)

        res.status(200).json({
            message: `OTP sent Successfully. It will be valid for 5 minutes. otp = ${otp}`,
            redirectURL: `/verify-otp?email=${email}&phoneNumber=${phoneNumber}`
        });

    } catch (err) {
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
        const storedOTP = await OTP.findOne({ phoneNumber: phoneNumber, otp: user_otp });
        // if otp expired
        if (!storedOTP) {
            return res.status(404).json({
                message: "OTP has expired, please retry again with newly generated OTP.",
                redirectURL: `/forgot-password?email=${email}&phoneNumber=${phoneNumber}`
            })
        }
        // new_password === retypped_password logic will be implemented in the form data automatically
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        if (!hashedPassword) {
            return res.status(401).json({
                message: "Password hashing failed",
                redirectURL: `/forgot-password/verify-otp?email=${email}&phoneNumber=${phoneNumber}`
            })
        }
        // OTP is valid; reset the user's password with updated password that is correctly generated
        await User.findOneAndUpdate({ userEmail: email, userPhoneNumber: phoneNumber }, { password: hashedPassword });

        res.status(201).json({
            message: "Password reset is successfull.",
        })

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