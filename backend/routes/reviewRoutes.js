// backend/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();

const { 
    createProductReview,
    getProductReviews,
    deleteMyReview,
    getAllReviewsAdmin,
    deleteReviewAdmin
} = require('../controllers/reviewController');

const { protect, authorizeRoles } = require('../middlewares/auth');

// --- Public Routes ---
router.route('/reviews/:id').get(getProductReviews); 

// --- User Routes ---
router.route('/review').put(protect, createProductReview); 
router.route('/review').delete(protect, deleteMyReview);

// --- Admin Routes ---
router.route('/admin/reviews/all').get(protect, authorizeRoles('admin'), getAllReviewsAdmin); 
router.route('/admin/review').delete(protect, authorizeRoles('admin'), deleteReviewAdmin);

module.exports = router;