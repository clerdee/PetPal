// src/components/checkoutform.jsx
import React, { useState, useEffect } from 'react';
// ⭐️ REMOVED: useAuth is no longer needed here

const PHILIPPINE_CITIES = [
    "Metro Manila (NCR)", "Taguig City", "Paranaque City", "Cebu City", "Davao City", "Quezon City", "Makati City", "Laguna City", "Pampanga City"
];

const CheckoutForm = ({ onFormUpdate, isProcessing }) => { 
    
    const [formData, setFormData] = useState({
        paymentMethod: 'COD', 
        ewalletType: 'GCASH', 
        ewalletNumber: '',
        cardNumber: '',
        expirationDate: '',
        securityCode: '',
        fullName: '',
        address: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            onFormUpdate(newData); 
            return newData;
        });
    };
    
    // --- Render Logic ---
    const isCardRequired = formData.paymentMethod === 'Credit/Debit Card';
    const isEWalletRequired = formData.paymentMethod === 'E-Wallet';
    const isCOD = formData.paymentMethod === 'COD';

    return (
        <div className="checkout-form-container">
            {/* --- 1. PAYMENT METHOD --- */}
            <h3>Payment Method</h3>
            <div className="form-group-row">
                <div className="form-group full-width">
                    <label>Select Payment Method</label>
                    <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} disabled={isProcessing}>
                        <option value="COD">Cash on Delivery (COD)</option>
                        <option value="E-Wallet">E-Wallet (GCASH/MAYA)</option>
                        <option value="Credit/Debit Card">Credit/Debit Card</option>
                    </select>
                </div>
            </div>

            {/* --- Conditional Payment Fields --- */}
            
            {/* E-WALLET FIELDS */}
            {isEWalletRequired && (
                <div className="form-group-row two-col">
                    <div className="form-group">
                        <label>E-Wallet Provider</label>
                        <select name="ewalletType" value={formData.ewalletType} onChange={handleChange} disabled={isProcessing}>
                            <option value="GCASH">GCASH</option>
                            <option value="MAYA">MAYA</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input type="text" name="ewalletNumber" placeholder="09xxxxxxxxx" onChange={handleChange} disabled={isProcessing} required />
                    </div>
                </div>
            )}

            {/* CREDIT/DEBIT CARD FIELDS */}
            {isCardRequired && (
                <div className="card-payment-fields">
                    <div className="form-group">
                        <label>Card number</label>
                        <div className="card-input-wrapper">
                            <input type="text" name="cardNumber" placeholder="•••• •••• •••• ••••" onChange={handleChange} disabled={isProcessing} required={isCardRequired} />
                            <div className="card-type-logos">
                                <img src="/images/visa.png" alt="Visa" /> 
                                <img src="/images/mastercard.png" alt="Mastercard" />
                            </div>
                        </div>
                    </div>
                    <div className="form-group-row two-col">
                        <div className="form-group">
                            <label>Expiration date</label>
                            <input type="text" name="expirationDate" placeholder="MM/YY" onChange={handleChange} disabled={isProcessing} required={isCardRequired} />
                        </div>
                        <div className="form-group">
                            <label>Security code</label>
                            <input type="text" name="securityCode" placeholder="123" onChange={handleChange} disabled={isProcessing} required={isCardRequired} />
                        </div>
                    </div>
                    
                    {/* ⭐️ ADDED: Billing name/address now part of payment ⭐️ */}
                    <div className="form-group" style={{marginTop: '1.5rem'}}>
                        <label>Full name (on card)</label>
                        <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} disabled={isProcessing} required={isCardRequired} />
                    </div>
                    <div className="form-group">
                        <label>Billing Address Line</label>
                        <input type="text" name="address" placeholder="Unit/House No., Street Name" onChange={handleChange} disabled={isProcessing} required={isCardRequired} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutForm;