const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
const {instance} = require('../config/razorpay');
const mailSender = require('../utils/mailSender');
const {courseEnrollmentEmail} = require('../mail/templates/courseEnrollmentEmail');

//capture the payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {
    //get courseId and userId
    const {course_id} = req.body;
    const userId = req.user.id;

    //validation
    //calid courseID
    if(!course_id){
        return res.status(400).json({
            success:false,
            message:'Please provide valid course ID'
        });
    }

    //valid courseDetail
    let course;
    try{
        course = await Course.findById(course_id);
        if(!course){
            return res.status(400).json({
                success:false,
                message:'Could not find the course'
            });
        }

        //user already paid or not                     ??
        const uid = new mongoose.Types.createFromTime(userId);  //depricated
        if(course.studentsEnrolled.includes(uid)){
            return res.status(400).json({
                success:false,
                message:'Student is already enrolled'
            });
        }
    }
    catch(e){
        console.error("Error in capturing payment ",e);
        return res.status(500).json({
            success:false,
            message:e.message
        });
    }
    
    //create order
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount*100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes:{
            courseId:course_id,
            userId
        }
    };
    try {
        //initiate the payment using razprpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        //return response
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount
        });
    } 
    catch (e) {
        console.error(e);
        return res.status(500).json({
            success:false,
            message:'Could not initiate order'
        });
    }
}




exports.verifySignature = async (req, res) => {
    const webHookSecret = "12345678";

    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac('sha256', webHookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature == digest){
        console.log('Payment is authorised');

        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try {
            //fulfill the action
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id:courseId},
                {$push:{studentsEnrolled: userId}},
                {new:true}
            );

            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:'Course not found'
                });
            };
            console.log("Enrolled course", enrolledCourse);

            
            //find the student and enroll the student in it'
            const enrolledStudent = await User.findOneAndUpdate(
                {_id:userId},
                {$push:{courses:courseId}},
                {new:true}
            );

            //mail send karo
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulations, you are onboarded",
                "Welcome to codehelp's new course"
            ); 

            console.log("Email response", emailResponse);
            return res.status(200).json({
                success:true,
                message:'Signature verified and course added'
            });
        } 
        catch (e) {
            console.error(e);
            return res.status(500).json({
                success:false,
                message:e.message
            });
        };

    }
    else{
        return res.status(400).json({
            success:false,
            message:'Invalid request'
        });
    }
};