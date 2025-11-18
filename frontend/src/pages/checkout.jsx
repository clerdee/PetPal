// src/pages/checkout.jsx
import React, { useState, useEffect } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import Loader from '../layout/Loader.jsx';
import CheckoutForm from '../components/checkoutform.jsx'; 
import { toast } from 'react-toastify'; 
import '../css/checkout-layout.css'; 

const Checkout = () => {
    const { cartItems, cartTotal, removeFromCart } = useCart();
    const { idToken, mongoUser } = useAuth(); 
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [deliveryData, setDeliveryData] = useState({
        recipientName: '', 
        phoneNumber: '',
        address: '', 
        city: '',
        country: 'Philippines',
        deliverToSelf: true, 
    });
    
    const [billingData, setBillingData] = useState({
        paymentMethod: 'COD', 
        fullName: '', 
        address: '',
        cardNumber: '',
    });

    const backendUrl = import.meta.env.VITE_APP_API_URL;

    // --- FINANCIAL CALCULATIONS ---
    const itemsPrice = cartItems.reduce((acc, item) => {
        const price = Number(item.price) || 0;
        const qty = Number(item.quantity) || 0;
        return acc + (price * qty);
    }, 0);
    const TAX_RATE = 0.05;
    const SHIPPING_RATE = 50.00;
    const taxPrice = itemsPrice * TAX_RATE;
    const shippingPrice = SHIPPING_RATE;
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    useEffect(() => {
        if (!loading && cartItems.length === 0) {
            navigate('/products');
        }
    }, [cartItems, loading, navigate]);

    // Populate state when mongoUser arrives
    useEffect(() => {
        if (mongoUser) {
            setDeliveryData(prev => ({
                ...prev,
                recipientName: mongoUser.fullName || mongoUser.name || '',
                phoneNumber: mongoUser.phoneNumber || '',
                address: mongoUser.shippingAddress || '', 
                city: mongoUser.city || 'Metro Manila',
                country: mongoUser.country || 'Philippines',
                deliverToSelf: true,
            }));
        }
    }, [mongoUser]);

    const handleFormUpdate = (data) => {
        setBillingData(data); 
    };

    // ⭐️ FIX: Updated handleDeliveryChange to be smarter ⭐️
    const handleDeliveryChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === "deliverToSelf") {
            // If the checkbox is clicked
            setDeliveryData(prev => ({
                ...prev,
                deliverToSelf: checked,
                // If checked, pre-fill with mongoUser's name.
                // If unchecked, clear it so the user can type.
                recipientName: checked ? (mongoUser?.fullName || mongoUser?.name || '') : ''
            }));
        } else {
            // For all other fields (phoneNumber, address, etc.)
            setDeliveryData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    
    const placeOrderHandler = async () => {
        if (cartItems.length === 0) return toast.error("Cart is empty.");
        
        // Validation check
        if (!deliveryData.recipientName || !deliveryData.phoneNumber || !deliveryData.address || !deliveryData.city) {
            return toast.warn("🚚 Please provide full recipient address details.", { position: "top-center" });
        }
        
        if (billingData.paymentMethod === 'Credit/Debit Card' && (!billingData.cardNumber || !billingData.fullName || !billingData.address)) {
             return toast.warn("🔑 For Credit Card payments, all billing fields are required.", { position: "top-center" });
        }
        if (billingData.paymentMethod === 'E-Wallet' && !billingData.ewalletNumber) {
             return toast.warn("🔑 Please provide your E-Wallet phone number.", { position: "top-center" });
        }
        
        setLoading(true);
        setError(null);

        // Fetch latest prices before creating order
        try {
            const fetches = cartItems.map(item => axios.get(`${backendUrl}/product/${item.id}`));
            const results = await Promise.all(fetches);
            const detailsMap = new Map(results.map(res => [res.data.product._id, res.data.product]));
            
            const orderItems = cartItems.map(item => {
                const prod = detailsMap.get(item.id);
                const latestPrice = Number(prod?.price ?? item.price) || 0;
                const qty = Number(item.quantity) || 0;
                return {
                    productId: item.id,
                    name: prod?.name || item.name,
                    price: latestPrice,
                    quantity: qty,
                    image: prod?.images?.[0]?.url || item.image
                };
            });
            
            const computedItemsPrice = orderItems.reduce((acc, oi) => acc + (Number(oi.price) * Number(oi.quantity)), 0);
            const computedTax = computedItemsPrice * TAX_RATE;
            const computedTotal = computedItemsPrice + SHIPPING_RATE + computedTax;
            
            const orderData = {
                orderItems,
                itemsPrice: Number(computedItemsPrice),
                taxPrice: Number(computedTax),
                shippingPrice: Number(SHIPPING_RATE),
                totalPrice: Number(computedTotal),
                paymentInfo: {
                    id: `PAY_SIM_${Date.now()}`,
                    status: 'succeeded',
                    cardLast4: billingData.cardNumber ? billingData.cardNumber.slice(-4) : 'N/A', 
                    cardType: billingData.paymentMethod || 'COD', 
                    billingName: billingData.fullName,
                    billingAddress: billingData.address,
                },
                shippingInfo: {
                    recipientName: deliveryData.recipientName,
                    phoneNumber: deliveryData.phoneNumber,
                    address: deliveryData.address,
                    city: deliveryData.city,
                    country: deliveryData.country
                },
            };

            const { data } = await axios.post(
                `${backendUrl}/order/new`,
                orderData,
                { headers: { 'Authorization': `Bearer ${idToken}` } }
            );

            const clearCartPromises = cartItems.map(item => removeFromCart(item.id));
            await Promise.all(clearCartPromises);

            setLoading(false);
            toast.success('🎉 Order placed successfully!', { position: "top-center" });
            navigate(`/products`); 

        } catch (err) {
            console.error("Order Placement Failed:", err);
            setError(err.response?.data?.message || "Order placement failed. Check your backend console for 500 details.");
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="checkout-page-wrapper">
            <div className="checkout-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    &larr; Back to Cart
                </button>
            </div>

            <div className="checkout-content-grid">
                <div className="main-checkout-content">
                    {error && <p className="error-message">{error}</p>}
                    
                    <h2>Delivery Details</h2>
                    <div className="delivery-form-container">
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" value={mongoUser?.email || ''} disabled className="profile-input" />
                        </div>
                        
                        <div className="form-group-row full-width checkbox-row">
                             <input 
                                type="checkbox" 
                                id="deliverToSelf" 
                                name="deliverToSelf"
                                checked={deliveryData.deliverToSelf}
                                onChange={handleDeliveryChange}
                            />
                            <label htmlFor="deliverToSelf" style={{ display: 'inline' }}> Deliver to myself ({mongoUser?.name})</label>
                        </div>
                        
                        <div className="form-group">
                            <label>Recipient Name</label>
                            {/* ⭐️ FIX: The 'disabled' prop now correctly reads from state ⭐️ */}
                            <input 
                                type="text" 
                                name="recipientName" 
                                value={deliveryData.recipientName} 
                                onChange={handleDeliveryChange} 
                                required 
                                disabled={deliveryData.deliverToSelf} // This will now work
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="text" name="phoneNumber" placeholder="e.g., 0917xxxxxxx" value={deliveryData.phoneNumber} onChange={handleDeliveryChange} required />
                        </div>
                        
                        <div className="form-group">
                            <label>Shipping Address</label>
                            <input type="text" name="address" placeholder="Unit/House No., Street" value={deliveryData.address} onChange={handleDeliveryChange} required />
                        </div>
                        
                        <div className="form-group-row">
                            <div className="form-group">
                                <label>City</label>
                                <input type="text" name="city" value={deliveryData.city} onChange={handleDeliveryChange} required />
                            </div>
                            <div className="form-group">
                                <label>Country</label>
                                <input type="text" name="country" value={deliveryData.country} disabled />
                            </div>
                        </div>
                    </div>
                    
                    <div className="payment-billing-wrapper">
                        <CheckoutForm 
                            onFormUpdate={handleFormUpdate} 
                            isProcessing={loading} 
                        />
                    </div>
                </div>

                <div className="order-summary-card">
                    <h2>Order Summary</h2>
                    <ul className="summary-products-list">
                        {cartItems.map(item => (
                            <li key={item.id} className="product-line-item">
                                <img src={item.image} alt={item.name} className="summary-thumb" />
                                <span className="item-name-qty">
                                    {item.name} <span className="item-qty">x{item.quantity}</span>
                                </span>
                                <span>₱{(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="summary-details">
                        <div className="summary-line">
                            <span>Subtotal ({cartItems.length} items)</span>
                            <span>₱{itemsPrice.toFixed(2)}</span>
                        </div>
                        <div className="summary-line">
                            <span>Shipping Fee</span>
                            <span>₱{shippingPrice.toFixed(2)}</span>
                        </div>
                        <div className="summary-line">
                            <span>VAT (5%)</span>
                            <span>₱{taxPrice.toFixed(2)}</span>
                        </div>
                        <div className="summary-line due-today grand-total-line">
                            <span>Total Payment</span>
                            <span>₱{totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                    <button 
                        onClick={placeOrderHandler} 
                        className="btn btn-primary btn-lg full-width-btn black-bg-btn"
                        disabled={cartItems.length === 0 || loading} 
                    >
                        {loading ? 'Processing...' : `Pay ₱${totalPrice.toFixed(2)} & Place Order`}
                    </button>
                    <p className="terms-text">
                        By placing your order, you agree to the Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Checkout;