// middlewares/auth.js
const admin = require('firebase-admin');
const User = require('../models/userModel');

/**
 * @desc    Checks for a valid Firebase ID token in the Authorization header.
 * If valid, attaches the corresponding MongoDB user to req.user.
 * @protects Routes
 */
exports.protect = async (req, res, next) => {
    let token;

    // 1. Check for the Authorization header and ensure it's a Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // 2. If no token is found, send a 401 Unauthorized response
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token.' });
    }

    // 3. We have a token. Now, try to verify it with Firebase Admin.
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);

        // 4. Token is valid! Now find this user in our *own* MongoDB
        const user = await User.findOne({ firebaseUid: decodedToken.uid });

        // 5. If we don't have this user in our database, something is wrong.
        if (!user) {
            return res.status(401).json({ message: 'User not found in our database.' });
        }
        
        // 6. SUCCESS! Attach our MongoDB user object to the request.
        req.user = user; 

        next();

    } catch (error) {
        console.error('Error verifying auth token:', error);
        return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
};

// ... (keep all your 'admin' and 'User' imports at the top)
// ... (keep the entire 'exports.protect' function)

/**
 * @desc    Checks if the user's role is allowed to access the route.
 * @protects Admin-only routes
 */
exports.authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // 1. We assume `protect` middleware has already run
        //    and attached `req.user`.
        if (!req.user) {
            return res.status(500).json({ message: 'Server error: User not found in request.' });
        }

        // 2. Get the user's role from the request object
        const userRole = req.user.role;

        // 3. Check if the user's role is in the list of allowed roles
        const isAllowed = allowedRoles.includes(userRole);

        if (!isAllowed) {
            // 4. FORBIDDEN.
            //    We use 403, not 401. 
            //    401 means "You're not logged in."
            //    403 means "We know who you are, but you are not allowed here."
            return res.status(403).json({
                success: false,
                message: `Forbidden: Your role ('${userRole}') is not authorized to access this resource.`
            });
        }

        // 5. SUCCESS! You're on the list.
        //    Proceed to the next function (e.g., the controller).
        next();
    };
};