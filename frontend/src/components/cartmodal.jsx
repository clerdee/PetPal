// src/components/CartModal.jsx
import React from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';
import Loader from '../layout/Loader.jsx';
import '../css/modal.css'; 
import '../css/cart.css'; 

const CartModal = ({ onClose }) => {
    // ⭐️ Added 'updateItemQuantity'
    const { cartItems, cartTotal, loading, removeFromCart, totalItems, updateItemQuantity } = useCart();
    const navigate = useNavigate();
    
    const handleCheckout = () => {
        if (cartItems.length === 0) return; 
        onClose(); 
        navigate('/checkout'); 
    };

    if (loading) return <div className="modal-backdrop"><Loader /></div>;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content modal-cart" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                
                <h2>Your Cart ({totalItems} items)</h2>
                
                {cartItems.length === 0 ? (
                    <div className="empty-cart-message">
                        <span className="empty-cart-icon">🛒</span>
                        <p>Your cart is empty.</p>
                        <button onClick={onClose} className="btn btn-primary">
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="cart-content-wrapper">
                        <div className="cart-items-list">
                            {cartItems.map((item) => (
                                <div key={item.id} className="cart-item-card">
                                    <img src={item.image} alt={item.name} className="cart-item-image" />
                                    <div className="cart-item-details">
                                        <h4 className="cart-item-name">{item.name}</h4>
                                        <p className="cart-item-price">₱{(Number(item.price) || 0).toFixed(2)}</p>
                                        
                                        {/* ⭐️ NEW: Quantity Controller ⭐️ */}
                                        <div className="quantity-controls">
                                            <button 
                                                className="qty-btn"
                                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                            >
                                                -
                                            </button>
                                            <span className="qty-display">{item.quantity}</span>
                                            <button 
                                                className="qty-btn"
                                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className="cart-item-subtotal">
                                        ₱{(((Number(item.price) || 0) * (Number(item.quantity) || 0))).toFixed(2)}
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="cart-item-remove"
                                        title="Remove item"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="cart-summary-footer">
                            <div className="cart-total-display">
                                <span>Subtotal:</span>
                                <span className="total-price">₱{(Number(cartTotal) || 0).toFixed(2)}</span>
                            </div>
                            <button 
                                onClick={handleCheckout} 
                                className="btn btn-primary btn-full-width"
                                disabled={cartItems.length === 0}> Proceed to Checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartModal;