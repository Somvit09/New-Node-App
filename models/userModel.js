// model for users only

const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    userEmail: String,
    userPhoneNumber: String,
    isMerchant: Boolean,
    isCustomer: Boolean
});

const User = mongoose.model('User', userSchema);

module.exports = User;