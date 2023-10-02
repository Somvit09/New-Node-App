const express = require("express")
const {register, verifyOTP} = require("../pages/register")

const registerRouter = express.Router()

// login user
registerRouter.post('/', register)
// verify otp
registerRouter.post('/verify-otp', verifyOTP)

module.exports = registerRouter