// backend/controllers/productController.js
const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('cloudinary');

// --- Helper function to handle CLOUDINARY UPLOADS ---
const uploadProductImages = async (images, folderName) => {
    const imagesLinks = [];
    const imagesToProcess = Array.isArray(images) ? images : [images];
    for (let i = 0; i < imagesToProcess.length; i++) {
        const result = await cloudinary.v2.uploader.upload(imagesToProcess[i], {
            folder: folderName,
        });
        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        });
    }
    return imagesLinks;
};

// --- Helper function to handle CLOUDINARY DELETION --
const deleteProductImages = async (images) => {
    for (let i = 0; i < images.length; i++) {
        await cloudinary.v2.uploader.destroy(images[i].public_id);
    }
};

// 🐾 CREATE NEW PRODUCT (Admin)
exports.newProduct = async (req, res, next) => {
    try {
        let images = [];
        if (req.body.images) {
            images = await uploadProductImages(req.body.images, 'products');
        }
        req.body.images = images;
        req.body.user = req.user.id; 
        const product = await Product.create(req.body);
        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        console.error("Product Creation Error:", error.message);
        res.status(500).json({ message: "Product creation failed", error: error.message });
    }
};

// 🐾 GET ALL PRODUCTS (Public)
exports.getProducts = async (req, res, next) => {
    try {
        const resPerPage = Number(req.query.limit) || 10; 
        const apiFeatures = new APIFeatures(Product.find(), req.query)
            .search()
            .filter();
            
        let productsWithoutPagination = await apiFeatures.query.clone(); 
        let filteredProductsCount = productsWithoutPagination.length; 

        apiFeatures.pagination(resPerPage);
        const products = await apiFeatures.query; 

        res.status(200).json({
            success: true,
            productsCount: await Product.countDocuments(),
            resPerPage, 
            filteredProductsCount,
            products
        });
    } catch (error) {
        console.error("Product Fetch Error:", error);
        res.status(500).json({ message: "Failed to fetch products", error: error.message });
    }
};

// 🐾 GET SINGLE PRODUCT (Public)
exports.getSingleProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch product", error: error.message });
    }
};

// 🐾 UPDATE PRODUCT (Admin)
exports.updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (req.body.images && req.body.images.length > 0) {
            await deleteProductImages(product.images);
            const images = await uploadProductImages(req.body.images, 'products');
            req.body.images = images;
        }
        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({ message: "Product update failed", error: error.message });
    }
};

// 🐾 DELETE PRODUCT (Admin)
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await deleteProductImages(product.images);
        await product.deleteOne();
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully.'
        });
    } catch (error) {
        res.status(500).json({ message: "Product deletion failed", error: error.message });
    }
}; 

// 🐾 DELETE MULTIPLE PRODUCTS (Admin)
exports.deleteProductsBulk = async (req, res, next) => {
    try {
        const { ids } = req.body; 
        if (!ids || ids.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of product IDs.' });
        }
        const productsToDelete = await Product.find({ '_id': { $in: ids } });
        if (productsToDelete.length === 0) {
            return res.status(404).json({ message: 'No products found with the provided IDs.' });
        }
        for (const product of productsToDelete) {
            await deleteProductImages(product.images);
        }
        const deleteResult = await Product.deleteMany({ '_id': { $in: ids } });
        res.status(200).json({
            success: true,
            message: `${deleteResult.deletedCount} products deleted successfully.`
        });
    } catch (error) {
        console.error("Bulk Deletion Error:", error);
        res.status(500).json({ message: "Bulk deletion failed", error: error.message });
    }
};
