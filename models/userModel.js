// model for users only

const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: String,
    userEmail: String,
    userPhoneNumber: String,
    isMerchant: Boolean,
    isCustomer: Boolean,
    password: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;