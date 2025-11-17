// models/userModel.js
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },

    fullName: {
        type: String,
        default: ''
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    shippingAddress: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: 'Metro Manila (NCR)'
    },
    country: {
        type: String,
        default: 'Philippines' 
    },
    active: { 
        type: Boolean,
        default: true
    },

    firebaseUid: {
        type: String,
        required: true,
        unique: true,
        index: true 
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
            default: 'avatars/default_avatar' 
        },
        url: {
            type: String,
            required: true,
            default: 'https://res.cloudinary.com/dvdrak5wl/image/upload/v1762984153/avatars/default_avatar.png' 
        }
    },
    role: {
        type: String,
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);