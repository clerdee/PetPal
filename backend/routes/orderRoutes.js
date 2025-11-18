// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();

const { 
    newOrder, 
    getSingleOrder, 
    myOrders, 
    getAllOrders, 
    updateOrder, 
    deleteOrder,
    deleteOrdersBulk
} = require('../controllers/orderController');

const { protect, authorizeRoles } = require('../middlewares/auth');

// --- User Routes ---
router.route('/order/new').post(protect, newOrder);
router.route('/order/:id').get(protect, getSingleOrder);
router.route('/orders/me').get(protect, myOrders);

// --- Admin Routes ---
router.route('/admin/orders').get(protect, authorizeRoles('admin'), getAllOrders);
router.route('/admin/orders/delete-bulk').delete(protect, authorizeRoles('admin'), deleteOrdersBulk);

router.route('/admin/order/:id')
    .get(protect, authorizeRoles('admin'), getSingleOrder) 
    .put(protect, authorizeRoles('admin'), updateOrder)
    .delete(protect, authorizeRoles('admin'), deleteOrder);

module.exports = router;