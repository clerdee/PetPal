const jwt = require('jsonwebtoken');

// Helper function to generate and send the token
const sendToken = (user, statusCode, res) => {

    // 1. Create the JWT
    // This token is what your backend will use for authentication
    const token = jwt.sign(
        { id: user._id }, 
        process.env.JWT_SECRET, 
        {
            expiresIn: process.env.JWT_EXPIRE_TIME
        }
    );

    // 2. Define cookie options
    const options = {
        expires: new Date(
            // Convert cookie expire time from days to milliseconds
            Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true, // Makes the cookie inaccessible to client-side JS
    };
    
    // 3. Set 'secure' flag in production (ensures cookie is only sent over HTTPS)
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    // 4. Send the response
    // We send the cookie AND a JSON response.
    // The frontend can use the 'user' object from the JSON to update its state (e.g., show "Welcome, John").
    // The frontend *never* needs to touch the token itself.
    res
        .status(statusCode)
        .cookie('token', token, options) // 'token' is the name of the cookie
        .json({
            success: true,
            token, // You can still send the token in the response if your client *also* needs it
            user   // Send the user data (minus the password)
        });
};

module.exports = sendToken;