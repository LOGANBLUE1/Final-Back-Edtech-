const jwt = require('jsonwebtoken');
require('dotenv').config();


exports.auth = async (req, res, next) => {
    try {
        //extract token
        const token = req.cookies.token || req.body.teken || req.header("Authorisation").replace("Bearer","");

        if(!token){
            return res.status(401).json({
                success:false,
                message:'Token is missing'
            });
        }

        //verify the token
        try{
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch(e){
            return res.status(401).json({
                success:false,
                message:'Token is invalid'
            });
        }

        next();
    }   
    catch (e) {
        return res.status(401).json({
            success:false,
            message:'Something went wrong while validating token'
        });
    }
}


exports.isStudent = async (req, res, next) => {
    try {
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:'This is protected type for Student only'
            }); 
        }
        // if isStudent
        next();
    } 
    catch (e) {
        return res.status(401).json({
            success:false,
            message:'User cannot be verified, please try again'
        });
    }
}

exports.isInstructor = async (req, res, next) => {
    try {
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:'This is protected type for Instructor only'
            }); 
        }

        next();
    } 
    catch (e) {
        return res.status(401).json({
            success:false,
            message:'User cannot be verified, please try again'
        });
    }
}

exports.isAdmin = async (req, res, next) => {
    try {
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:'This is protected type for Admin only'
            }); 
        }
        
        next();
    } 
    catch (e) {
        return res.status(401).json({
            success:false,
            message:'User cannot be verified, please try again'
        });
    }
}