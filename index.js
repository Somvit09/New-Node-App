const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); //Cross-Origin Resource Sharing (CORS) middleware
const multer = require('multer'); // middleware for handling file uploads

const app = express();

// load varialbles from .env
require('dotenv').config(); 
const port = process.env.PORT;
const database = process.env.DATABASE_NAME;


// router configuration
const apparelRoutes = require("./routes/crud")
const otpRouters = require("./routes/loginOrRegistrationRoute")


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
const OTP = require('./models/otpModel');



// routers for crud in apparel

app.use('/apparel', apparelRoutes)

app.use('/login', otpRouters)

app.use('/register', otpRouters)



app.listen(port, () => {
    console.log(`Server is running on the port ${port}`);
});