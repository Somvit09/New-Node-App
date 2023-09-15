const OTP = require('../models/otpModel')
const User = require("../models/userModel")
const mongoose = require("mongoose")

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

// sending the otp

const sendOTP = async (req, res) => {
    const phoneNumberToSendOTP = req.body.phoneNumber;
    const email = req.body.email;
    const { isMerchant, isCustomer } = req.body
    const otp = generateRandomOTP();

    // stored the otp to the model

    await OTP.create({ phoneNumber:phoneNumberToSendOTP, otp:otp});

    // send otp to the user mobile number
    try {
        console.log(`Your OTP is sent to the mobile number ${phoneNumberToSendOTP}.`);
        const newUser = await User.findOne({
            userEmail:email, 
            userPhoneNumber: phoneNumberToSendOTP,
        })
        if (newUser) {
            /// we need to think about something if a user already existed
            res.status(200).json({"message": "User already existed"});
            return
        } else {
            await User.create({
                userEmail:email, 
                userPhoneNumber: phoneNumberToSendOTP,
                isMerchant: isMerchant,
                isCustomer: isCustomer
            })
        }
        await client.messages.create({
            body: `Your otp is ${otp}. It will be valid for 5 minutes.`,
            from: twilioPhoneNumber,
            to: phoneNumberToSendOTP,
        })
        res.status(200).json({message: `OTP sent Successfully. otp is ${otp}. It will be valid for 5 minutes.`});
    } catch (error) {
        console.log(`Failed to send otp to the phone number ${phoneNumberToSendOTP}.`);
        res.status(500).json({error: error.message});
    }

}

// verifying opt

verifyOTP = async (req, res) => {
    const {phoneNumber, user_otp} = req.body;

    try {
        const storedOTP = await OTP.findOne({phoneNumber:phoneNumber, otp:user_otp});
        if (storedOTP && storedOTP.otp === user_otp) {
            res.status(200).json({message: `OTP verified successfully`});
        } else {
            res.status(400).json({error: "Invalid OTP."});
        }

    } catch (err) {
        res.status(500).json({error: err.message});
    }
}


module.exports = {
    sendOTP, verifyOTP
}



