// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();

const { protect, authorizeRoles } = require('../middlewares/auth');

const {
    getAllUsers,
    deleteUser
} = require('../controllers/adminController');

const { 
    updateUserRoleStatus 
} = require('../controllers/authController');

const { 
    getMonthlySales,
    getSalesByDateRange 
} = require('../controllers/orderController');

const {
    getAllReviewsAdmin,
    deleteReviewAdmin
} = require('../controllers/reviewController');

router.get('/users', protect, authorizeRoles('admin'), getAllUsers);

router.delete('/user/:id', protect, authorizeRoles('admin'), deleteUser);

router.route('/user/:id')
    .delete(protect, authorizeRoles('admin'), deleteUser)
    .put(protect, authorizeRoles('admin'), updateUserRoleStatus);

router.route('/sales/monthly').get(protect, authorizeRoles('admin'), getMonthlySales);
router.route('/sales/range').get(protect, authorizeRoles('admin'), getSalesByDateRange);


module.exports = router;