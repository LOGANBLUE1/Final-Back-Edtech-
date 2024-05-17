const User = require('../models/User');
const OTP = require('../models/OTP');
const Profile = require('../models/Profile');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv').config();

exports.sendOTP = async (req,res) => {
    try {
        const {email} = req.body;

        const checkUserPresent = await User.findOne({email});
        //if user already exists
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User already exists'
            })
        }

        //generating OTP
        let otp = generateOTP();                    //scope of improvement
        console.log("OTP genereated : ",otp);

        // check unique otp or not
        const result = await OTP.findOne({otp: otp});

        while(result){
            otp = generateOTP();
            result = await OTP.findOne({otp:otp});
        }

        const otpPayload = {email, otp};
        //creating an entry in db
        const otpBody = await OTP.create(otpPayload);
        console.log("Otp body : ",otpBody);

        return res.status(200).json({
            success:true,
            message:'OTP sent successfully',
            otp
        });

    } 
    catch (e) {
        return res.status(500).json({
            success:false,
            message:e.message
        })
    }
}

let generateOTP = () => {
    return otpGenerator.generate(6, {
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false
    });
}








exports.signUp = async (req,res)  => {
    try{
        const {
            firstName,
            lastName,
            email, 
            password, 
            confirmPassword,
            accountType, 
            contactNumber, 
            otp
        } = req.body;
    
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:'All fields are required'
            });
        }
    
        if(password != confirmPassword){
            return res.status(400).json({
                success:false,
                message:'password values does not match with confirm password'
            });
        }
    
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:'User is already registered'
            });
        }
    
        const recentOTp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOTp);
    
        if(recentOTp.length == 0){
            return res.status(400).json({
                success:false,
                message:'OTP not found'
            });
        }//otp different
        else if(otp != recentOTp.otp){
            return res.status(403).json({
                success:false,
                message:'otp did not match'
            });
        }
    
        //hash password
        const hashedPAssword = await bcrypt.hash(password, 10);
    
        const profileDetails = await Profile.create
    
        const user = await User.create({
            firstName,
            lastName,
            email, 
            password:hashedPAssword, 
            accountType, 
            additionalDetails:profileDetails, 
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`   // api to  create profile pic from name
        })

        return res.status(200).json({
            success:true,
            message:'User registered successfully'
        });
    }
    catch(e){
        return res.status(403).json({
            success:false,
            message:'User cannot be registered, Try again'
        });
    }
}







exports.login = async (req,res) => {
    try {
        //check data from req body 
        const {email, password} = req.body;

        // validation data 
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:'Allfields are required'
            });
        }
        
        // user check exist or not
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success:false,
                message:'User not registered, please signup first'
            });
        }

        //fenerate JWT, after password matching
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType
            };
            
            const token = jwt.sign(payload, process.env.JWT_SECTRET, {
                expiresIn: "2h"
            });
            user.token = token;
            user.password = undefined;
            
            //create coookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in successfully'
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:'Password is incorrect'
            });
        }
    } 
    catch (e) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login failure, Try again'
        });
    }
}






exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};