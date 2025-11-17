// backend/controllers/authController.js
const User = require('../models/userModel');
const admin = require('firebase-admin'); 
const cloudinary = require('cloudinary');
// const admin = require('../config/firebaseAdmin');
const sendToken = require('../utils/jwtToken');

// ---------------------------------------------------------------
// 🐾 CREATE/UPDATE USER (LOGIN/REGISTER HANDLER)
// ---------------------------------------------------------------
exports.createOrUpdateUser = async (req, res, next) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ message: 'No ID token provided.' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { name, email, uid } = decodedToken;

        let user = await User.findOne({ firebaseUid: uid });

        if (user) {
            return res.status(200).json({
                success: true,
                message: "Welcome back to PetPal! 🐾",
                user,
            });
        } else {
            const newUser = await User.create({
                firebaseUid: uid,
                email: email,
                name: name || email.split('@')[0], 
            });
            
            return res.status(201).json({
                success: true,
                message: "Welcome to PetPal! 🐶",
                user: newUser,
            });
        }
    } catch (error) {
        console.error("Create/Update User Error:", error.message);
        return res.status(400).json({ message: "Authentication failed. Token may be invalid.", error: error.message });
    }
};

// ---------------------------------------------------------------
// 🐾 GET USER PROFILE
// ---------------------------------------------------------------
exports.getUserProfile = async (req, res, next) => {
    const user = await User.findById(req.user.id); 

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
        success: true,
        user
    });
};

// ---------------------------------------------------------------
// 🐾 UPDATE USER PROFILE 
// ---------------------------------------------------------------
exports.updateProfile = async (req, res, next) => {

    const { name, email, avatar, fullName, phoneNumber, shippingAddress, city, country } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    const newUserData = {
        fullName: fullName,
        phoneNumber: phoneNumber,
        shippingAddress: shippingAddress,
        city: city,
        country: country,
    };
    const firebaseUpdates = {}; 

    try {
        if (email && email !== user.email) {
            await admin.auth().updateUser(user.firebaseUid, { email: email });
            newUserData.email = email; 
        }

        if (name && name !== user.name) {
            newUserData.name = name;
            firebaseUpdates.displayName = name;
        }

        if (avatar) { 
            if (user.avatar && user.avatar.public_id !== 'avatars/default_avatar') { 
                await cloudinary.v2.uploader.destroy(user.avatar.public_id);
            }

            const result = await cloudinary.v2.uploader.upload(avatar, {
                folder: 'avatars',
                width: 150,
                crop: "scale"
            });

            newUserData.avatar = {
                public_id: result.public_id,
                url: result.secure_url
            };
            firebaseUpdates.photoURL = result.secure_url;
        }

        if (Object.keys(firebaseUpdates).length > 0) {
            await admin.auth().updateUser(user.firebaseUid, firebaseUpdates);
        }

        const updatedUser = await User.findByIdAndUpdate(user.id, newUserData, {
            new: true, 
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Profile and shipping details updated successfully 🐶",
            user: updatedUser
        });

    } catch (error) {
        if (error.code && error.code === 'auth/email-already-in-use') {
            return res.status(409).json({ 
                message: 'This email is already in use by another account.', 
                error: error.message 
            });
        }
        console.error("Update Profile Error:", error);
        return res.status(500).json({ message: "Profile update failed", error: error.message });
    }
};

// ---------------------------------------------------------------
// 🐾 ADMIN: UPDATE USER ROLE/STATUS 
// ---------------------------------------------------------------
exports.updateUserRoleStatus = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { role, active } = req.body; 

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updateFields = {};
        if (role) updateFields.role = role;
        if (active !== undefined) updateFields.active = active;

        const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        if (role && role !== user.role) {
        }

        if (req.user.id.toString() === userId.toString() && active === false) {
             return res.status(400).json({ message: 'Error: Cannot deactivate your own admin account.' });
        }

        res.status(200).json({
            success: true,
            message: `User ${updatedUser.name} updated successfully.`,
            user: updatedUser
        });

    } catch (error) {
        console.error("Admin User Update Error:", error);
        res.status(500).json({ message: "User update failed", error: error.message });
    }
};

// ---------------------------------------------------------------
// SOCIAL LOGIN HANDLER
// ---------------------------------------------------------------
exports.socialLogin = async (req, res, next) => {
    try {
        const { token } = req.body;

        // 1. Verify the Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);

        // 2. Get user info from the token
        const { email, name, picture } = decodedToken;

        // 3. Check if user exists in your MongoDB
        let user = await User.findOne({ email });

        // 4. If user does not exist, create them
        if (!user) {
            user = await User.create({
                name,
                email,
                avatar: {
                    public_id: 'default_avatar', 
                    url: picture
                },
            });
        }

        sendToken(user, 200, res);

    } catch (error) {
        console.error(error);
        res.status(401).json({ success: false, message: 'Invalid social login token' });
    }
};