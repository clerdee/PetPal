// backend/controllers/orderController.js
const Order = require('../models/orderModel');
const Product = require('../models/productModel'); 
const sendEmail = require('../utils/sendEmail'); 
// const createPDF = require('../utils/createPDF');

const updateStock = async (id, quantity) => {
    const product = await Product.findById(id);
    if (product) {
        product.stock -= quantity;
        await product.save({ validateBeforeSave: false });
    }
};

/**
 * @desc    Create new Order (User)
 * @route   POST /api/v1/order/new
 * @access  Private
 */
exports.newOrder = async (req, res, next) => {
    const { 
        orderItems, itemsPrice, taxPrice, shippingPrice, 
        totalPrice, paymentInfo, shippingInfo 
    } = req.body;
    
    try {
        const order = await Order.create({
            orderItems,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo,
            shippingInfo,
            paidAt: Date.now(),
            user: req.user.id,
        });

        for (const item of order.orderItems) {
            await updateStock(item.productId, item.quantity);
        }

        await order.populate('user', 'name email');

        // --- 🐾 "Order Confirmation" Email Template ---
        const itemsHtml = order.orderItems.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; display: flex; align-items: center;">
                    <img src="${item.image}" alt="${item.name}" width="60" height="60" style="border-radius: 8px; margin-right: 10px;">
                    ${item.name}
                </td>
                <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right;">₱${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `).join('');

        const emailMessage = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <style> body { font-family: Arial, sans-serif; } </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="width: 600px; margin: 20px auto; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                <tr>
                    <td align="center" style="background-color: #e67e22; padding: 25px; color: #ffffff;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🐾 Your PetPal Order is Confirmed!</h1>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 30px 40px;">
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">
                            Hi ${order.user.name},
                        </p>
                        <p style="font-size: 16px; color: #333; line-height: 1.6;">
                            Get ready for some happy paws! 🐶 Your order is confirmed and we're getting it ready for your furry friend.
                        </p>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #ddd; border-radius: 8px; margin-top: 25px; margin-bottom: 25px;">
                            <tr>
                                <td style="padding: 20px;">
                                    <h3 style="margin-top: 0; margin-bottom: 15px; color: #e67e22;">Order Summary</h3>
                                    <p style="margin: 5px 0; font-size: 15px;"><strong>Order ID:</strong> ${order._id}</p>
                                    <p style="margin: 5px 0; font-size: 15px;"><strong>Order Status:</strong> ${order.orderStatus}</p>
                                    <p style="margin: 5px 0; font-size: 15px;"><strong>Payment Status:</strong> ${order.paymentInfo.status}</p>
                                </td>
                            </tr>
                        </table>
                        <h3 style="margin-top: 25px; margin-bottom: 15px; color: #333;">Items Ordered</h3>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                            <thead style="background-color: #f9f9f9;">
                                <tr>
                                    <th style="padding: 12px; text-align: left; color: #555;">Product</th>
                                    <th style="padding: 12px; text-align: center; color: #555;">Quantity</th>
                                    <th style="padding: 12px; text-align: right; color: #555;">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>${itemsHtml}</tbody>
                        </table>
                        <table align="right" border="0" cellpadding="0" cellspacing="0" style="margin-top: 20px; width: 280px;">
                            <tr>
                                <td style="padding: 5px; font-size: 15px;">Items Price:</td>
                                <td style="padding: 5px; font-size: 15px; text-align: right;">₱${order.itemsPrice.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px; font-size: 15px;">Shipping:</td>
                                <td style="padding: 5px; font-size: 15px; text-align: right;">₱${order.shippingPrice.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px; font-size: 15px;">Tax:</td>
                                <td style="padding: 5px; font-size: 15px; text-align: right;">₱${order.taxPrice.toFixed(2)}</td>
                            </tr>
                            <tr style="border-top: 2px solid #ccc;">
                                <td style="padding: 10px 5px; font-size: 18px; font-weight: bold;">Total Paid:</td>
                                <td style="padding: 10px 5px; font-size: 18px; text-align: right; font-weight: bold; color: #e67e22;">
                                    ₱${order.totalPrice.toFixed(2)}
                                </td>
                            </tr>
                        </table>
                        <h3 style="margin-top: 25px; margin-bottom: 15px; color: #333; clear: both; padding-top: 20px;">Shipping To:</h3>
                        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; font-size: 15px; line-height: 1.7;">
                            Name: <strong>${order.shippingInfo.recipientName}</strong><br>
                            Address: ${order.shippingInfo.address}<br>
                            ${order.shippingInfo.city}, ${order.shippingInfo.country}<br>
                            Phone: ${order.shippingInfo.phoneNumber}
                        </div>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding: 20px 40px; background-color: #f9f9f9; border-top: 1px solid #eee;">
                        <p style="margin: 0; font-size: 13px; color: #888;">
                            Thanks for being a Pawsome customer!
                        </p>
                        <p style="margin: 5px 0 0; font-size: 13px; color: #888;">
                            © ${new Date().getFullYear()} PetPal. All rights reserved.
                        </p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;
        
        try {
            const info = await sendEmail({
                email: order.user.email,
                subject: `PetPal Order Confirmation #${order._id}`,
                html: emailMessage,
            });
            console.log(`📧 Confirmation email sent: messageId=${info.messageId}`);
        } catch (emailError) {
            console.error("❌ Email sending failed, but order was created:", emailError);
        }

        return res.status(201).json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Order Creation Error:", error);
        return res.status(500).json({ message: "Failed to create order", error: error.message });
    }
};

exports.getSingleOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) {
            return res.status(404).json({ message: 'Order not found with this ID' });
        }
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch order", error: error.message });
    }
};

exports.myOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch orders", error: error.message });
    }
};

exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().populate('user', 'name email');
        let totalAmount = 0;
        orders.forEach(order => {
            totalAmount += order.totalPrice;
        });
        res.status(200).json({ success: true, totalAmount, orders });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch all orders", error: error.message });
    }
};

/**
 * @desc    Update Order Status (Admin)
 */
exports.updateOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        console.log(`🔄 Update request: order=${req.params.id}, current=${order?.orderStatus}, target=${req.body.status}`);

        if (!order) {
            return res.status(404).json({ message: 'Order not found with this ID' });
        }
        if (order.orderStatus === 'Delivered' && req.body.status === 'Delivered') {
            return res.status(400).json({ message: 'This order has already been delivered.' });
        }
        
        order.orderStatus = req.body.status;
        
        if (req.body.status === 'Delivered') {
            order.deliveredAt = Date.now();
        }

        await order.save();
        console.log(`💾 Order saved: newStatus=${order.orderStatus}, deliveredAt=${order.deliveredAt || 'n/a'}`);

        let emailSubject = `PetPal Order Update: Your order is now ${order.orderStatus}!`;
        let emailHtml;

        if (order.orderStatus === 'Delivered') {
            emailSubject = `Your PetPal Order #${order._id} Has Been Delivered! 🐾`;

            const itemsHtml = order.orderItems.map(item => `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; display: flex; align-items: center;">
                        <img src="${item.image}" alt="${item.name}" width="60" height="60" style="border-radius: 8px; margin-right: 10px;">
                        ${item.name}
                    </td>
                    <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                    <td style="padding: 10px; text-align: right;">₱${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
            `).join('');

            emailHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head><meta charset="UTF-8"><style> body { font-family: Arial, sans-serif; } </style></head>
            <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="width: 600px; margin: 20px auto; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <tr>
                        <td align="center" style="background-color: #27ae60; padding: 25px; color: #ffffff;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎉 Your Order Has Arrived!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px;">
                            <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${order.user.name},</p>
                            <p style="font-size: 16px; color: #333; line-height: 1.6;">
                                Great news! Your PetPal Order #${order._id} has been successfully delivered. We hope your pet loves their new goodies! 🦴
                            </p>
                            <h3 style="margin-top: 25px; margin-bottom: 15px; color: #333;">Items Delivered</h3>
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                                <thead style="background-color: #f9f9f9;">
                                    <tr>
                                        <th style="padding: 12px; text-align: left; color: #555;">Product</th>
                                        <th style="padding: 12px; text-align: center; color: #555;">Quantity</th>
                                        <th style="padding: 12px; text-align: right; color: #555;">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>${itemsHtml}</tbody>
                            </table>
                            <table align="right" border="0" cellpadding="0" cellspacing="0" style="margin-top: 20px; width: 280px;">
                                <tr style="border-top: 2px solid #ccc;">
                                    <td style="padding: 10px 5px; font-size: 18px; font-weight: bold;">Total Paid:</td>
                                    <td style="padding: 10px 5px; font-size: 18px; text-align: right; font-weight: bold; color: #e67e22;">
                                        ₱${order.totalPrice.toFixed(2)}
                                    </td>
                                </tr>
                            </table>
                            <h3 style="margin-top: 25px; margin-bottom: 15px; color: #333; clear: both; padding-top: 20px;">Delivered To:</h3>
                            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; font-size: 15px; line-height: 1.7;">
                                Name: <strong>${order.shippingInfo.recipientName}</strong><br>
                                Address: ${order.shippingInfo.address}<br>
                                ${order.shippingInfo.city}, ${order.shippingInfo.country}<br>
                                Phone: ${order.shippingInfo.phoneNumber}
                            </div>
                            
                            <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 20px;">
                                Don't forget to <a href="http://localhost:5173/rate">leave a review</a>!
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 20px 40px; background-color: #f9f9f9; border-top: 1px solid #eee;">
                            <p style="margin: 0; font-size: 13px; color: #888;">© ${new Date().getFullYear()} PetPal. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            `;
        
        } else {
            // This is the email for "Processing" or "Shipped"
            emailHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="width: 600px; margin: 20px auto; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <tr>
                        <td align="center" style="background-color: #3498db; padding: 25px; color: #ffffff;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">A Paws-itive Update!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px;">
                            <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${order.user.name},</p>
                            <p style="font-size: 16px; color: #333; line-height: 1.6;">
                                We've got an update on your PetPal Order #${order._id}.
                            </p>
                            <div style="background-color: #f9f9f9; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0;">
                                <p style="margin: 0; font-size: 16px; color: #555;">Your order's new status is:</p>
                                <p style="margin: 10px 0 0; font-size: 24px; font-weight: bold; color: #3498db;">
                                    ${order.orderStatus}
                                </p>
                            </div>
                            ${order.orderStatus === 'Shipped' ? 
                                `<p style="font-size: 16px; color: #333; line-height: 1.6;">Your treats are on the way! 🚚</p>` : ''
                            }
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 20px 40px; background-color: #f9f9f9; border-top: 1px solid #eee;">
                            <p style="margin: 0; font-size: 13px; color: #888;">© ${new Date().getFullYear()} PetPal. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            `;
        }

        // ✅ FIX: Moved this block *outside* of the 'else' statement
        await sendEmail({
            email: order.user.email,
            subject: emailSubject,
            html: emailHtml,
        })

        res.status(200).json({
            success: true,
            order,
            message: `Status updated and HTML email sent to ${order.user?.email}`
        })
        
    } catch (error) {
        console.error("Order Update Error:", error)
        return res.status(500).json({ message: "Failed to update order status", error: error.message })
    }
};

exports.deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found with this ID' });
        }
        await order.deleteOne();
        res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete order", error: error.message });
    }
};

exports.deleteOrdersBulk = async (req, res, next) => {
    try {
        const { ids } = req.body; 

        if (!ids || ids.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of order IDs.' });
        }

        const deleteResult = await Order.deleteMany({ '_id': { $in: ids } });

        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ message: 'No orders found with the provided IDs.' });
        }

        res.status(200).json({
            success: true,
            message: `${deleteResult.deletedCount} orders deleted successfully.`
        });

    } catch (error) {
        console.error("Bulk Order Deletion Error:", error);
        res.status(500).json({ message: "Bulk deletion failed", error: error.message });
    }
}; 

exports.getMonthlySales = async (req, res, next) => {
    try {
        const sales = await Order.aggregate([
            { $match: { 
                orderStatus: { $ne: "Processing" }, 
                paidAt: { $exists: true } 
            }},
            {
                $group: {
                    _id: { 
                        year: { $year: "$paidAt" },
                        month: { $month: "$month" }
                    },
                    totalSales: { $sum: "$totalPrice" },
                    totalOrders: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        res.status(200).json({ success: true, sales });
    } catch (error) {
        console.error("Monthly Sales Chart Error:", error);
        res.status(500).json({ message: "Failed to fetch monthly sales data.", error: error.message });
    }
};

exports.getSalesByDateRange = async (req, res, next) => {
    const { startDate, endDate } = req.query; 

    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1); 

        const sales = await Order.aggregate([
            { $match: {
                orderStatus: { $ne: "Processing" },
                paidAt: { $exists: true },
                paidAt: { $gte: start, $lte: end }
            }},
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
                totalSales: { $sum: "$totalPrice" },
                totalOrders: { $sum: 1 }
            }},
            { $sort: { "_id": 1 } } 
        ]);

        res.status(200).json({ success: true, sales });
    } catch (error) {
        console.error("Date Range Sales Chart Error:", error);
        res.status(500).json({ message: "Failed to fetch date range sales data.", error: error.message });
    }
};