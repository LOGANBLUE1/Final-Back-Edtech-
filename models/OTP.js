const mongoose = require('mongoose');

const otpScmena = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires: 5*60 //seconds
    }
});

module.exports = mongoose.model("OTP",otpScmena);