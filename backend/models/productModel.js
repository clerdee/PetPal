// backend/models/productModel.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        maxlength: [5, 'Product price cannot exceed 5 digits'],
        default: 0.0
    },
    description: {
        type: String,
        required: [true, 'Please enter product description'],
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
        }
    ],
    category: {
        type: String,
        required: [true, 'Please select category for this product'],
        enum: {
            values: [
                'Clothes',
                'Food',
                'Grooming',
                'Toys',
                'Service' 
            ],
            message: 'Please select correct category for product'
        }
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        maxlength: [5, 'Product stock cannot exceed 5 digits'],
        default: 0
    },

    // ⭐️ This is the Admin/User who created the product ⭐️
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },

    // ⭐️ This is where the reviews are stored ⭐️
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: { 
                type: String,
                required: true
            },
            rating: { 
                type: Number,
                required: true
            },
            comment: { 
                type: String,
                required: true
            }
        }
    ],
    numOfReviews: {
        type: Number,
        default: 0
    },
    ratings: { 
        type: Number,
        default: 0
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);