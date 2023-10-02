const express = require("express")
const {login, verifyOTP} = require("../pages/login")

const loginRouter = express.Router()

// login user
loginRouter.post('/', login)
// verify otp
loginRouter.post('/verify-otp', verifyOTP)

module.exports = loginRouter