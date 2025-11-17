// backend/models/orderModel.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            image: { type: String, required: true },
            productId: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true
            },
        }
    ],
    // ⭐️ EXPANDED SHIPPING INFO ⭐️
    shippingInfo: {
        recipientName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        address: { type: String, required: true }, // Street/Unit
        city: { type: String, required: true },
        country: { type: String, required: true },
    },
    
    // ⭐️ EXPANDED PAYMENT INFO ⭐️
    paymentInfo: {
        id: { type: String, required: true },
        status: { type: String, required: true },
        cardType: { type: String, required: true }, // e.g. "COD", "GCASH", "Credit Card"
        cardLast4: { type: String }, // Optional, for cards
    },

    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    
    orderStatus: {
        type: String,
        required: true,
        default: 'Processing'
    },
    
    paidAt: { type: Date },
    deliveredAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);