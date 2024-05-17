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



exports.categoryPageDetails = async (req, res) => {
    try {
            //get categoryId
            const {categoryId} = req.body;
            //get courses for specified categoryId
            const selectedCategory = await Category.findById(categoryId)
                                            .populate("courses")
                                            .exec();
            //validation
            if(!selectedCategory) {
                return res.status(404).json({
                    success:false,
                    message:'Data Not Found',
                });
            }
            //get coursesfor different categories
            const differentCategories = await Category.find(
                                        {_id: {$ne: categoryId},}// ne - not equal
                                        )
                                        .populate("courses")
                                        .exec();

            //get top 10 selling courses
            //HW - write it on your own

            //return response
            return res.status(200).json({
                success:true,
                data: {
                    selectedCategory,
                    differentCategories,
                },
            });

    }
    catch(e) {
        console.log(e);
        return res.status(500).json({
            success:false,
            message:e.message,
        });
    }
}