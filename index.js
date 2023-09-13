const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); //Cross-Origin Resource Sharing (CORS) middleware
const multer = require('multer'); // middleware for handling file uploads

const app = express();

// load varialbles from .env
require('dotenv').config(); 
const port = process.env.PORT;
const database = process.env.DATABASE_NAME;
// for otp
const twilio = require('twilio');
const twilioAccountSid = process.env.YOUR_TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.YOUR_TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.YOUR_TWILIO_PHONE_NUMBER;

// router configuration
const apparelRoutes = require("./routes/crud")

// initializing the Twilio client
const client = twilio(twilioAccountSid, twilioAuthToken);


// Middlewares
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI + database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:')); //This line sets up an event listener for the 'error' event of the MongoDB database 
db.once('open', () => {   //sets up an event listener for the 'open' event of the MongoDB database 
    console.log('Connected to MongoDB');
});

// getting the models

const Apparel = require('./models/apparel_model');
const Customer = require('./models/customer_model');
const Merchant = require('./models/merchant_model');
const OTP = require('./models/otpModel');


// routers for crud in apparel

app.use('/apparel', apparelRoutes)


// Helper function to generate a random OTP
function generateRandomOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


// otp generation and verification
app.post('/send_otp', async (req, res) => {
    const phoneNumberToSendOTP = req.body.phoneNumber;
    const otp = generateRandomOTP();

    // stored the otp to the model

    await OTP.create({ phoneNumber:phoneNumberToSendOTP, otp:otp});

    // send otp to the user mobile number
    try {
        client.messages.create({
            body: `Your otp is ${otp}. It will be valid for 5 minutes.`,
            from: twilioPhoneNumber,
            to: phoneNumberToSendOTP,
        })
        console.log(`Your OTP is sent to the mobile number ${phoneNumberToSendOTP}.`);
        res.status(200).json({message: `OTP sent Successfully. otp is ${otp}. It will be valid for 5 minutes.`});
    } catch (error) {
        console.log(`Failed to send otp to the phone number ${phoneNumberToSendOTP}.`);
        res.status(500).json({error: error.message});
    }

});

// otp validation
app.post('/veryfy_otp', async (req, res) => {
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
});



app.listen(port, () => {
    console.log(`Server is running on the port ${port}`);
});