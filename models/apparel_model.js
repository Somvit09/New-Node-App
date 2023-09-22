const mongoose = require('mongoose');

const apparalSchema = new mongoose.Schema({
    apparelID: String,
    apparelName: String,
    apparelType: String,
    imageUrl: String, // uploading images and store the path
    uploadDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
});

const Apparel = mongoose.model('Apparel', apparalSchema);

module.exports = Apparel;