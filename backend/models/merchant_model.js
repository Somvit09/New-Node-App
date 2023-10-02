const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
    merchantID: Number,
    merchantName: String,
    merchantType: String,
});

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;