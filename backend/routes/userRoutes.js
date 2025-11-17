// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');

const { 
    createOrUpdateUser,
    getUserProfile,
    updateProfile,
    socialLogin 
} = require('../controllers/authController');

router.route('/auth/create-or-update-user').post(createOrUpdateUser); 
router.route('/me').get(protect, getUserProfile); 
router.route('/me/update').put(protect, updateProfile);
router.route('/auth/social-login').post(socialLogin);

module.exports = router;    