import React from 'react';
import { Link } from 'react-router-dom';
import '../css/productcard.css';
import { useCart } from '../context/CartContext.jsx'; 
import { useAuth } from '../context/AuthContext.jsx'; 
import { toast } from 'react-toastify';
import { Rating } from '@mui/material';
import { Box } from '@mui/system';

function ProductCard({ product }) {
    const { addToCart } = useCart();
    const { currentUser } = useAuth();
    const mainImage = product.images && product.images.length > 0 ? product.images[0].url : '/images/pet-icon.png';

    const handleAddToCart = async () => {
        if (!currentUser) {
            toast.warn('🔑 Please sign in or create an account to add items.', {
            position: "bottom-right"
        });
            return;
        }

        const result = await addToCart(product, 1);
        if (result.success) {
            toast.success(`🐶 ${product.name} added to cart!`, { position: "top-center" });
        } else {
            toast.error(`Error: ${result.message}`, { position: "top-center" });
        }
    };

    return (
        <div className="product-card">
            <Link to={`/product/${product._id}`} className="product-link">
                <div className="product-image-wrapper">
                    <img src={mainImage} alt={product.name} className="product-image" />

                    <span className={`category-badge category-${product.category.toLowerCase()}`}>
                        {product.category}
                    </span>
                    
                    {product.stock === 0 && <span className="out-of-stock-badge">Out of Stock</span>}
                </div>
                
                <div className="product-details">
                    <h3 className="product-name">{product.name}</h3>

                    <Box 
                        className="product-rating-wrapper"
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 0.5, 
                            minHeight: '24px' 
                        }}
                    >
                        {product.numOfReviews > 0 ? (
                            <>
                                <Rating 
                                    value={product.ratings} 
                                    readOnly 
                                    precision={0.5} 
                                    size="small" 
                                />
                                <span className="product-review-count">
                                    ({product.numOfReviews})
                                </span>
                            </>
                        ) : (
                            <span className="product-review-count no-reviews">
                                (No reviews)
                            </span>
                        )}
                    </Box>

                    <p className="product-price">₱{product.price.toFixed(2)}</p>
                </div>
            </Link>
            <button 
                type="button"
                onClick={handleAddToCart} 
                className="btn btn-primary btn-add-cart"
                disabled={product.stock === 0}
            >
                {product.stock > 0 ? 'Add to Cart' : 'SOLD OUT'}
            </button>
        </div>
    );
};

export default ProductCard;