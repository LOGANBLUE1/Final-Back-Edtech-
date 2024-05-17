const Course = require('../models/Course');
const Category = require('../models/Categories');
const User = require('../models/User');
const {uploadImageToCloudinary} = require('../utils/imagareUploader');





exports.createCourse = async (req, res) => {
    try {
        const {courseName, courseDescription, whatYouWillLearn, price, category} = req.body;

        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!thumbnail || !courseDescription || !price || !category || !courseName || !whatYouWillLearn){
            return res.status(400).json({
                success:false,
                message:'All fields are mendatory'
            });
        }

        //check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);// for newCourse
        console.log("Instructor details : ",instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:'Instructor details not found'
            });
        }

        //check given category is valid or not
        const categoryDetails = Category.findById(category);//because in category id is stored
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:'Category details not found'
            });
        }

        //Upload to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
        
        //create an entry for new Course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn,
            price,
            category:categoryDetails._id,
            thumbnail:thumbnailImage.secure_url
        });

        //add the new course to user schema of instructor
        await User.findByIdAndUpdate(
            {id:instructorDetails._id},
            {$push:{courses:newCourse._id}},
            {new:true}
        );

        return res.status(200).json({
            success:true,
            message:'Course created successfully',
            data:newCourse
        });
    } 
    catch (e) {
        return res.status(500).json({
            success:false,
            message:'Failed to create course',
            error:e.message
        });
    }
};





exports.showAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({},{
            courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true
        }).populate('instructor').exec();

        return res.status(200).json({
            success:true,
            message:'Data for all courses fetched successfully',
            data:allCourses
        });
    }
    catch (e) {
        return res.status(500).json({
            success:false,
            message:'Failed to create course', 
            error:e.message
        });
    }
}



exports.getCourseDetails = async (req, res) => {
    try {
        //get id
        const {courseId} = req.body;
        
        //find course details
        const courseDetails = await Course.find({_id:courseId})
                .populate({
                    path:"instructor",
                    populate:{path:"additionaltDetails"}
                })
                .populate("category")
                .populate("ratingAndReviews")
                .populate({
                    path:"courseContent",
                    populate:{path:"subSection"}
                })
                .exec();

        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`Could not find the course with ${courseId}`
            });
        }

        return res.status(200).json({
            success:true,
            message:'Course details fetched successfully'
        });
        
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({
            success:false,
            message:'Failed to create course', 
            error:e.message
        });
    }
}