const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); //Cross-Origin Resource Sharing (CORS) middleware
const multer = require('multer'); // middleware for handling file uploads
const app = express();
require('dotenv').config(); // load varialbles from .env
const port = process.env.PORT;
const database = process.env.DATABASE_NAME;
// for otp
const twilioAccountSid = process.env.YOUR_TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.YOUR_TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.YOUR_TWILIO_PHONE_NUMBER;


// Middlewares
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI + database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:')); //This line sets up an event listener for the 'error' event of the MongoDB database 
db.once('open', () => {   //sets up an event listener for the 'open' event of the MongoDB database 
    console.log('Connected to MongoDB');
});

// getting the models

const Apparel = require('./models/apparel_model');
const Customer = require('./models/customer_model');
const Merchant = require('./models/merchant_model');

// Create an Apparel

app.post('/apparel', async (req, res) => {
    try{
        const newApparel = new Apparel(req.body);
        const savedApparel = await newApparel.save();
        res.status(201).json(savedApparel);
    } catch (err) {
        res.status(400).json({'error': err.message});
    }
});

// Get all Apparel

app.get('/apparel', async(req, res) => {
    try{
        const allApparel = await Apparel.find();
        res.json(allApparel);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// Get a specific apparel by ID

app.get('/apparel/:id', async(req, res) => {
    try{
        const apparel = await Apparel.findOne({apparelID: req.params.id}); // using findOne function to get the object associated with apparel id 
        if (!apparel){
            return res.status(404).json({error: 'Apparel Not found.'});
        }
        res.json(apparel);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// Update an apparel by apparelID

app.put('/apparel/:id', async(req, res) => {
    try{
        const updatedApparel = await Apparel.findOneAndUpdate(
            {apparelID: req.params.id},
            req.body,
            {new : true});
        if (!updatedApparel) {
            return res.status(404).json({error: 'Apparel not found'});
        } 
        res.json(updatedApparel);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// Delete an apparel 

app.delete('/apparel/:id', async(req, res) => {
    try{
        deleteApparel = await Apparel.findOneAndDelete({apparelID: req.params.id});
        if (!deleteApparel){
            return res.status(404).json({error: "Apparel not gound."});
        }
        res.json(deleteApparel);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});


app.listen(port, () => {
    console.log(`Server is running on the port ${port}`);
});