const Category = require('../models/Categories');

exports.createCategory = async (req, res) => {
    try {
        const {name, description} = req.body;

        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:'All fields are required'
            });
        }

        const caregoryDetails = await Category.create({
            name:name,
            description:description
        });
        console.log(caregoryDetails);

        return res.status(200).json({
            success:true,
            message:'Tage created successfully'
        });
        
    } 
    catch (e) {
        return res.status(500).json({
            success:false,
            message:e.message
        });
    }
};

exports.showAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find({},{name:true, description:true});
        
        return res.status(200).json({
            success:true,
            message:'All tags returned successfully',
            allCategories
        });
    } 
    catch (e) {
        return res.status(500).json({
            success:false,
            message:e.message
        });
    }
}