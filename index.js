const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); //Cross-Origin Resource Sharing (CORS) middleware
const multer = require('multer'); // middleware for handling file uploads
const jwt = require("jsonwebtoken")

const app = express();

// Serve images from the 'uploads' directory
app.use('/uploads', express.static('uploads'));


// storage middleware for uploading images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    },
})

// creating a multer instance with the specified storage
const upload = multer({
    storage: storage
})


// load varialbles from .env
require('dotenv').config(); 
const port = process.env.PORT;
const database = process.env.DATABASE_NAME;


// router configuration
const apparelRoutes = require("./routes/crud")
const loginRouter = require("./routes/loginRoute")
const registerRouter = require('./routes/registerRoute')


// Middlewares
app.use(express.json());
app.use(cors());
function authenticationToken(req, res, next) {
    const token = req.header("Authorization")
    if (!token) {
        return res.status(400).json({
            error: "Unauthorized"
        })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({error: "Token is not valid"})
        }
        req.user = decoded
        //console.log(req.user)
        next()
    })
}


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
const { register } = require('./pages/register');



// routers for crud in apparel

app.use('/apparel', apparelRoutes)

app.use('/login', loginRouter)

app.use('/register', registerRouter)


// authentication required for this route using authenticationToken middleware
app.post('/protected_route', authenticationToken, (req, res) => {
    const userEmail = req.user.newOrExistedUser.userEmail
    console.log(userEmail)
    res.status(200).json({message: userEmail})
})

// for uploading a file
app.post('/upload_image', upload.single('image'), async (req, res) => {
    const fileName = req.file.filename
    try {
        if (!fileName) {
            return res.status(400).json({error: "No file Uploaded."})
        } 
        const imageUrl = '/uploads/' + fileName
        res.status(201).json({
            'imageURL': imageUrl,
            'success': "Uploaded"
        })

    } catch(err) {
        res.status(500).json({error: err.message})
    }
})


app.listen(port, () => {
    console.log(`Server is running on the port ${port}`);
});