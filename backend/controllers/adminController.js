// backend/controllers/adminController.js
const User = require('../models/userModel');
const admin = require('firebase-admin'); 
const cloudinary = require('cloudinary');

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/v1/admin/users
 * @access  Private (Admin)
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
};

/**
 * @desc    Delete a user (Admin)
 * @route   DELETE /api/v1/admin/user/:id
 * @access  Private (Admin)
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: `User not found with id: ${req.params.id}` });
        }

        await admin.auth().deleteUser(user.firebaseUid);

        if (user.avatar.public_id !== 'avatars/default_avatar') { 
            await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: `User ${user.name} (Email: ${user.email}) has been deleted.`
        });

    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
};