// src/pages/Home/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../css/home.css';

const Home = () => {
return (
<div className="home-container">
<div className="home-hero-section">

<div className="hero-content">
<h1>
     Everything Your Pet Needs, <br />
<span className="text-orange">All in One Place</span>
</h1>
<p>
Premium pet products and professional grooming services delivered with love.
Because your furry friends deserve the best care.
</p>

<div className="hero-stats">
<div className="stat">
<strong>10K+</strong>
<span>Happy Pets</span>
</div>
<div className="stat">
<strong>500+</strong>
<span>Products</span>
</div>
<div className="stat">
<strong>4.9</strong>
<span>Rating</span>
</div>
</div>

<div className="hero-buttons">
<Link to="/products" className="btn btn-primary">
 Shop Products
 </Link>
 <Link to="/services" className="btn btn-green">
 Book Grooming
 </Link>
 </div>
 </div>

<div className="hero-image-box">

                    <div className="deco-shape shape-1"></div>
                    <div className="deco-shape shape-2"></div>

<div className="badge quality-badge">
                        <span role="img" aria-label="star">⭐</span> Premium Quality
</div>

<div className="pet-silhouette">
    <img src="../public/images/pet-silhouette.png" alt="A silhouette of a dog and cat" />
</div>

<div className="badge delivery-badge">
                        <span role="img" aria-label="truck">🚚</span> Fast Delivery
 </div>
</div>
</div>
</div>
 );
};

export default Home;