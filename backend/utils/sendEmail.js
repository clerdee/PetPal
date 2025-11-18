// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');
const validator = require('validator');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    if (!options.email || !validator.isEmail(options.email)) {
        console.error(`❌ Invalid recipient email: ${options.email}`);
        throw new Error('Invalid recipient email');
    }

    const message = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
        attachments: options.attachments || []
    };

    const info = await transporter.sendMail(message);
    
    console.log(`✅ Email sent: messageId=${info.messageId}`);
    return info;
};

module.exports = sendEmail;