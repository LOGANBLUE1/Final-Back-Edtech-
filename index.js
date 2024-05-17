const express = require('express');
const app = express();

const userRoutes = require('./routes/User');
const profileRoutes = require('./routes/Profile');
const paymetnRoutes = require('./routes/Payments');
const courseRoutes = require('./routes/Course');

const database = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {cloudinaryConnect} = require('./config/cloudinary');
const fileUpload = require('express-fileupload');
const { default: paymentLink } = require('razorpay/dist/types/paymentLink');
require('dotenv').config();

const PORT = process.env.PORT || 4100;

//databese connect
database.connect();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:"http//:localhost:3000",
        credentials:true
    })
)
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp"
}));

//connect to cloudinary
cloudinaryConnect();

//routes
app.use('/api/b1/auth', userRoutes);
app.use('/api/b1/profile', profileRoutes);
app.use('/api/b1/course', courseRoutes);
app.use('/api/b1/payment', paymetnRoutes);


//def route
app.get('/', (req, res) => {
    return res.json({
        success:true,
        message:'Your server is up and running....'
    });
});

//start server
app.listen(PORT, () => {
    console.log(`App is running at ${PORT}`)
})