// backend/controllers/reviewController.js
const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
// const Filter = require('bad-words');

async function updateProductRating(productId) {
    const reviews = await Review.find({ product: productId });
    const numOfReviews = reviews.length;
    
    const ratings = numOfReviews === 0 ? 0 : 
        reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews;

    await Product.findByIdAndUpdate(productId, {
        ratings,
        numOfReviews
    });
}

// ---------------------------------------------------------------
// 🐾 CREATE OR UPDATE A REVIEW (User)
// ---------------------------------------------------------------
exports.createProductReview = async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const reviewData = {
        product: productId,
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment: comment 
    };

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        let review = await Review.findOne({ product: productId, user: req.user._id });

        if (review) {
            review.rating = rating;
            review.comment = comment; 
            await review.save();
        } else {
            review = await Review.create(reviewData);
        }

        await updateProductRating(productId);

        res.status(200).json({
            success: true,
            message: "Review submitted successfully!"
        });

    } catch (error) {
        console.error("Review Error:", error);
        res.status(500).json({ message: 'Failed to submit review.', error: error.message });
    }
};

// ---------------------------------------------------------------
// 🐾 GET A PRODUCT'S REVIEWS (Public)
// ---------------------------------------------------------------
exports.getProductReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ product: req.params.id });
        
        res.status(200).json({
            success: true,
            reviews
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to get reviews.', error: error.message });
    }
};

// ---------------------------------------------------------------
// 🐾 DELETE *MY* REVIEW (User)
// ---------------------------------------------------------------
exports.deleteMyReview = async (req, res, next) => {
    try {
        const { reviewId, productId } = req.query;
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(4.04).json({ message: 'Review not found.' });
        }

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this review.' });
        }

        await review.deleteOne();
        
        await updateProductRating(productId);
        
        res.status(200).json({
            success: true,
            message: "Your review has been deleted."
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to delete review.', error: error.message });
    }
};

// ---------------------------------------------------------------
// 🐾 GET ALL REVIEWS (Admin - For the DataTable)
// ---------------------------------------------------------------
exports.getAllReviewsAdmin = async (req, res, next) => {
    try {
        // Populate product and user info for the admin table
        const reviews = await Review.find()
            .populate('product', 'name')
            .populate('user', 'name');

        res.status(200).json({
            success: true,
            reviews
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch reviews.', error: error.message });
    }
};

// ---------------------------------------------------------------
// 🐾 DELETE A REVIEW (Admin - 5pts)
// ---------------------------------------------------------------
exports.deleteReviewAdmin = async (req, res, next) => {
    try {
        const { reviewId, productId } = req.query;
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        await review.deleteOne();
        
        await updateProductRating(productId);
        
        res.status(200).json({
            success: true,
            message: "Review deleted successfully by admin."
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to delete review.', error: error.message });
    }
};