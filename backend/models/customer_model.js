const mongoose = require('mongoose');

const sizeDetailSchema = new mongoose.Schema({
    neck: Number,
    back: Number,
    shoulder: Number,
    length: Number,
    waist: Number,
    chest: Number,
    sleeve: Number,
    hip: Number,
    inseam: Number,
    thigh: Number,
    calf: Number,
    ankle: Number,
    // Add more size details as needed
});

const customerSchema = new mongoose.Schema({
    customerID: Number,
    customername: String,
    customerImages: [String],//Array of image urls
    customerSizeDetails: sizeDetailSchema,
});

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;