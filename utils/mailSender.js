const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async (email, title, body) => {
    try{
        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:MAIL_USER,
                pass:MAIL_PASS
            }
        });

        let info  = transporter.sendMail({
            from:`LOGAN`,
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`
        });
        console.log(info);
    }
    catch(e){
        console.error("Error occurs while sending mail, in mailsender",e);
    };
};

module.exports = mailSender;