import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; 
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.js';
import { useCart } from '../context/CartContext.jsx';
import CartModal from '../components/cartmodal.jsx';
import LoginModal from '../components/loginmodal.jsx';
import RegisterModal from '../components/registermodal.jsx';
import { Badge, IconButton } from '@mui/material';
import { ShoppingCartOutlined } from '@mui/icons-material';

import '../css/header.css';

const Header = () => {
    const { currentUser } = useAuth();
    const { totalItems } = useCart();
    const navigate = useNavigate();

    // ⭐️ 1. Replace separate states with one 'modalView' state
    const [modalView, setModalView] = useState(null); // 'login', 'register', or null
    const [showCart, setShowCart] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

    // ⭐️ 2. Add handler functions for switching and closing
    const handleCloseModal = () => {
        setModalView(null);
    };

    const handleSwitchToRegister = () => {
        setModalView('register');
    };

    const handleSwitchToLogin = () => {
        setModalView('login');
    };

    return (
        <>
            <header className="header-container">
                <Link to="/" className="header-logo">
                    <span>🐾</span> 
                    <strong>PetPal</strong>
                </Link>

                <nav className="header-nav">
                    <NavLink to="/" end>Home</NavLink>
                    <NavLink to="/products">Shop</NavLink>
                    <NavLink to="/rate">Review</NavLink>
                </nav>

                <div className="header-auth">
                    <IconButton onClick={() => setShowCart(true)} className="cart-icon-btn" aria-label="cart">
                        <Badge badgeContent={totalItems} color="primary">
                            <ShoppingCartOutlined />
                        </Badge>
                    </IconButton>

                    {currentUser ? (
                        <>
                            <Link to="/profile" className="btn btn-secondary">
                                Profile
                            </Link>
                            <button onClick={handleLogout} className="btn btn-primary">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            {/* ⭐️ 3. Update buttons to use setModalView */}
                            <button onClick={() => setModalView('login')} className="btn btn-secondary">
                                Sign In
                            </button>
                            <button onClick={() => setModalView('register')} className="btn btn-primary">
                                Create Account
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* ⭐️ 4. Update modal rendering logic */}
            {modalView === 'login' && (
                <LoginModal 
                    onClose={handleCloseModal}
                    onSwitch={handleSwitchToRegister}
                />
            )}
            
            {modalView === 'register' && (
                <RegisterModal 
                    onClose={handleCloseModal}
                    onSwitch={handleSwitchToLogin}
                />
            )}

            {showCart && <CartModal onClose={() => setShowCart(false)} />}
        </>
    );
};

export default Header;