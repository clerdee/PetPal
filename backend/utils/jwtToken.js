const jwt = require('jsonwebtoken');

const sendToken = (user, statusCode, res) => {

    const token = jwt.sign(
        { id: user._id }, 
        process.env.JWT_SECRET, 
        {
            expiresIn: process.env.JWT_EXPIRE_TIME
        }
    );

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true, 
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }
    
    res
        .status(statusCode)
        .cookie('token', token, options) 
        .json({
            success: true,
            token, 
            user   
        });
};

module.exports = sendToken;