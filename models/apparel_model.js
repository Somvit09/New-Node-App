const mongoose = require('mongoose');

const apparalSchema = new mongoose.Schema({
    apparelID: String,
    apparelName: String,
    apparelType: String,
});

const Apparel = mongoose.model('Apparel', apparalSchema);

module.exports = Apparel;