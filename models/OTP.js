const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');

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

const sendVerification = async (email, otp) => {
    try {
        const mailResponse = await mailSender(email,"Verification mail from LOGAN", otp);
        console.log("Email Sent Successfully", mailResponse);
    } catch (error) {
        console.error("Error while sending mail",error);
        throw error;
    }
}

otpScmena.pre("save", async function(next){
    await sendVerification(this.email,this.otp);
    next();
})

module.exports = mongoose.model("OTP",otpScmena);