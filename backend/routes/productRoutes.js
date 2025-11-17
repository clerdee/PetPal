// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();

// Use require and remove the .js extension
const { 
    getProducts, 
    newProduct, 
    getSingleProduct, 
    updateProduct, 
    deleteProduct,
    deleteProductsBulk
} = require('../controllers/productController');

// Use require and remove the .js extension
const { protect, authorizeRoles } = require('../middlewares/auth');

// --- Public Routes ---
router.route('/products').get(getProducts);
router.route('/product/:id').get(getSingleProduct);

// --- Admin Product Routes (Require Auth & Role Check) ---
router.route('/admin/product/new').post(protect, authorizeRoles('admin'), newProduct);

router.route('/admin/product/:id')
    .put(protect, authorizeRoles('admin'), updateProduct)
    .delete(protect, authorizeRoles('admin'), deleteProduct);

router.route('/admin/products/delete-bulk').delete(protect, authorizeRoles('admin'), deleteProductsBulk);

// Use module.exports instead of export default
module.exports = router;