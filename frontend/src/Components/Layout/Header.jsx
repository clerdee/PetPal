// Layout/Header.jsx
import React, { useState } from "react"; 
import "../CSS/Header.css";
import petIcon from "/images/pet-icon.png";
import LoginModal from "../Home/LoginModal";

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <img src={petIcon} alt="PetPal Logo" />
          <h1>PetPal</h1>
        </div>

        <nav className="nav-links">
          <a href="/">Home</a>
          <a href="/services">Services</a>
          <a href="/products">Products</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>

        <div className="header-buttons">
          <button className="sign-in" onClick={() => setShowLogin(true)}>
            Sign In
          </button>
          <button className="get-started">Create Account</button>
        </div>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </header>
  );
};

export default Header;