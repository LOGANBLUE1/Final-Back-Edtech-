const Section = require('../models/Section');
const Course = require('../models/Course');
 


exports.createSection = async (req, res) => {
    try {
        //data fetch
        const {sectionName, courseId} = req.body;

        // data velidation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties'
            });
        }

        //create section
        const newSection = await Section.create({sectionName});

        //update course with section objectId
        const updateCourseDetails = await Course.findByIdAndUpdate(courseId, {$push:{courseContent:newSection._id}},{new:true});



        //return response
        return res.status(200).json({
            success:true,
            message:'Session created Successfully',
            updateCourseDetails
        });
    }
    catch (e) {
        return res.status(500).json({
            success:false,
            message:'Unable to create section, Try again'
        });
    }
}




exports.updateSection = async (req, res) => {
    try {
        const {sectionName, sectionId} = req.body;

        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties'
            });
        }

        const section = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});

        return res.status(200).json({
            success:true,
            message:'Session updated Successfully',
            section
        });
    }
    catch(e){
        return res.status(500).json({
            success:false,
            message:'Unable to update section, Try again'
        });
    }
}




exports.updateSection = async (req, res) => {
    try {
        const sectionId = req.body.sectionId;

        if(!sectionId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties'
            });
        }

        const section = await Section.findByIdAndDelete(sectionId);

        return res.status(200).json({
            success:true,
            message:'Session deleted Successfully',
            section
        });
    }
    catch(e){
        return res.status(500).json({
            success:false,
            message:'Unable to delete section, Try again'
        });
    }
}