const express = require('express')

const { sendOTP, verifyOTP } = require("../pages/loginORRegister")

const router_otp = express.Router()

// sending otp
router_otp.post('/send_otp', sendOTP)

// verifying otp
router_otp.post('/verify_otp', verifyOTP)

module.exports = router_otp