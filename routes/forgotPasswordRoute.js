const express = require("express")
const {forgotPassword, verifyPasswordResetOTP} = require("../pages/forgotPassword")

const forgotPasswordRouter = express.Router()

// sending otp for reseting password
forgotPasswordRouter.post('/', forgotPassword)

// verifying otp
forgotPasswordRouter.post('/verify-password', verifyPasswordResetOTP)


module.exports = forgotPasswordRouter