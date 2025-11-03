import React from "react";
import "../CSS/Home.css";

const Home = () => {
  return (
    <section className="home">
      <div className="home-content">
        <h1>
          Everything Your <br />
          <span>Pet Needs, <span className="highlight">All in One Place</span></span>
        </h1>
        <p>
          Premium pet products and professional grooming services delivered with love.  
          Because your furry friends deserve the best care.
        </p>

        <div className="home-buttons">
          <button className="shop-btn">🛒 Shop Products</button>
          <button className="book-btn">✂️ Book Grooming</button>
        </div>

        <div className="stats">
          <div><strong>10K+</strong><br />Happy Pets</div>
          <div><strong>500+</strong><br />Products</div>
          <div><strong>4.9⭐</strong><br />Rating</div>
        </div>
      </div>

      <div className="home-image">
        <div className="image-card">
          <img src="/images/pet-icon.png" alt="Pet" />
          <span className="tag top-left">❤️ Premium Quality</span>
          <span className="tag bottom-right">🚚 Fast Delivery</span>
        </div>
      </div>
    </section>
  );
};

export default Home;
