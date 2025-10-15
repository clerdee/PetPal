const User = require('../models/userModel');
const crypto = require('crypto');
const cloudinary = require('cloudinary');
const sendEmail = require('../utils/sendEmail'); 

// 🐾 REGISTER USER
exports.registerUser = async (req, res, next) => {
    try {
        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        });

        const { name, email, password } = req.body;

        const user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: result.public_id,
                url: result.secure_url
            },
        });

        const token = user.getJwtToken();

        return res.status(201).json({
            success: true,
            message: "Welcome to PetPal! Registration successful 🐶",
            user,
            token
        });
    } catch (error) {
        console.error("Register Error:", error.message);
        return res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

// 🐾 LOGIN USER
exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter email & password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({ message: 'Invalid Email or Password' });
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return res.status(401).json({ message: 'Invalid Email or Password' });
    }

    const token = user.getJwtToken();

    res.status(200).json({
        success: true,
        message: "Login successful! 🐾",
        token,
        user
    });
};

// 🐾 FORGOT PASSWORD
exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(404).json({ message: 'No account found with that email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://localhost:5173/password/reset/${resetToken}`;

    const message = `Hello ${user.name},\n\nYou requested a password reset for your PetPal account.\nReset it using the link below:\n\n${resetUrl}\n\nIf you didn’t request this, please ignore this email.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'PetPal Password Recovery',
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ message: error.message });
    }
};

// 🐾 RESET PASSWORD
exports.resetPassword = async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = user.getJwtToken();

    res.status(201).json({
        success: true,
        message: "Password has been successfully reset 🐾",
        token,
        user
    });
};

// 🐾 GET USER PROFILE
exports.getUserProfile = async (req, res, next) => {
    const user = await User.findById(req.user.id);

    return res.status(200).json({
        success: true,
        user
    });
};

// 🐾 UPDATE USER PROFILE
exports.updateProfile = async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    };

    // Update avatar if new image uploaded
    if (req.body.avatar && req.body.avatar !== '') {
        const user = await User.findById(req.user.id);
        const image_id = user.avatar.public_id;
        await cloudinary.v2.uploader.destroy(image_id);

        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        });

        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        };
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
    });

    if (!user) {
        return res.status(400).json({ message: 'User not found or update failed' });
    }

    res.status(200).json({
        success: true,
        message: "Profile updated successfully 🐶",
        user
    });
};

// 🐾 UPDATE PASSWORD
exports.updatePassword = async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    const isMatched = await user.comparePassword(req.body.oldPassword);
    if (!isMatched) {
        return res.status(400).json({ message: 'Old password is incorrect' });
    }

    user.password = req.body.password;
    await user.save();

    const token = user.getJwtToken();

    res.status(201).json({
        success: true,
        message: "Password updated successfully 🐾",
        user,
        token
    });
};
