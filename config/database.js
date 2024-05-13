const mongoose = require('mongoose');
require('dotenv').config();

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then(() => 
        console.log("DB ka Connection is Successful")
    )
    .catch( (error) => {
        console.log("There is an error in DB connection");
        console.error(error,"Issue in DB Connection");
        process.exit(1);
    });
}