// src/layout/Footer.jsx
import React from "react";
import { Link } from 'react-router-dom';
import '../css/footer.css'; // We'll create this file next

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* Column 1: Brand & Slogan */}
        <div className="footer-column brand">
          <h3>PetPal</h3>
          <p>Everything your pet needs, all in one place.</p>
        </div>
        
        {/* Column 2: Navigation Links */}
        <div className="footer-column links">
          <h4>Navigation</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Shop</Link></li>
            <li><Link to="/rate">Rate</Link></li>
          </ul>
        </div>

        {/* Column 3: Account Links */}
        <div className="footer-column links">
          <h4>My Account</h4>
          <ul>
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/checkout">View Cart</Link></li>
            <li><Link to="/admin/dashboard">Admin Login</Link></li>
          </ul>
        </div>

        {/* Column 4: Social Media */}
        <div className="footer-column social">
          <h4>Follow Us</h4>
          <p>Stay in touch for the latest news and offers.</p>
          <div className="social-icons">
            {/* Replace '#' with your actual links */}
            <a href="#" aria-label="Facebook">FB</a>
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Twitter">TW</a>
          </div>
        </div>

      </div>
      
      {/* Bottom Copyright Bar */}
      <div className="footer-bottom">
        <p>© 2025 PetPal. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;