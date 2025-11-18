// src/pages/productdetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; 
import axios from 'axios';
import Loader from '../layout/Loader.jsx'; 
import '../css/productdetails.css'; 
import { useCart } from '../context/CartContext.jsx'; 
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify'; 
import { Rating, Avatar, Box, Typography } from '@mui/material'; 

const ProductDetails = () => {
    const { addToCart } = useCart();
    const { currentUser } = useAuth();
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const backendUrl = import.meta.env.VITE_APP_API_URL;

    const handleAddToCart = async () => {
        if (!currentUser) {
            toast.warn('🔑 Please sign in or create an account to add items.', { position: "bottom-right" });
            return;
        }
        if (!product) return; 
        const result = await addToCart(product, 1);
        if (result.success) {
            toast.success(`🐶 ${product.name} added to cart!`, { position: "top-center" });
        } else {
            toast.error(`Error: ${result.message}`, { position: "top-center" });
        }
    };

    useEffect(() => {
        const fetchProductAndReviews = async () => {
            setLoading(true);
            try {
                const [productResponse, reviewsResponse] = await Promise.all([
                    axios.get(`${backendUrl}/product/${id}`),
                    axios.get(`${backendUrl}/reviews/${id}`)
                ]);

                const fetchedProduct = productResponse.data.product;
                setProduct(fetchedProduct);
                setReviews(reviewsResponse.data.reviews);

                const firstImage = fetchedProduct?.images?.[0]?.url || '/images/pet-icon.png';
                setMainImage(firstImage);

                setLoading(false);
            } catch (err) {
                console.error("Fetch Product Error:", err);
                setError("Product not found or failed to load.");
                setLoading(false);
            }
        };
        fetchProductAndReviews();
    }, [id, backendUrl]);

    if (loading) return <Loader />;
    if (error) return <div className="single-product-error"><h2>{error}</h2></div>;
    if (!product) return null;

    return (
        <div className="product-details-container">
            <div className="product-back-button">
                <button onClick={() => window.history.back()} className="btn btn-back">
                    &larr; Back to Products
                </button>
            </div>

            {/* ⭐️ SECTION 1: THE GALLERY (Was Missing) ⭐️ */}
            <div className="product-gallery">
                <div className="main-image-viewer">
                    <img src={mainImage || '/images/pet-icon.png'} alt={product.name} />
                </div>
                <div className="thumbnail-strip">
                    {(product.images || []).map((image, index) => (
                        <img 
                            key={index}
                            src={image.url}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            className={image.url === mainImage ? 'active' : ''}
                            onClick={() => setMainImage(image.url)}
                        />
                    ))}
                </div>
            </div>

            {/* ⭐️ SECTION 2: THE INFO (Was Missing) ⭐️ */}
            <div className="product-info">
                <span className={`category-badge category-info-page category-${product.category.toLowerCase()}`}>
                    {product.category}
                </span>
                
                <h1>{product.name}</h1>
                
                <div className="price-tag">
                    ₱{product.price.toFixed(2)}
                </div>

                {/* This part was rendering */}
                <div className="rating-section">
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Rating value={product.ratings} precision={0.5} readOnly />
                        <Typography variant="body2" color="textSecondary">
                            ({product.numOfReviews} Reviews)
                        </Typography>
                    </Box>
                </div>

                <div className="stock-info">
                    Status: <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                        {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                    </span>
                </div>

                <div className="description-box">
                    <h2>Description</h2>
                    <p>{product.description}</p>
                </div>

                <button 
                    type="button"
                    onClick={handleAddToCart} 
                    className="btn btn-primary btn-lg" 
                    disabled={product.stock === 0}
                >
                    {product.stock > 0 ? 'Add to Cart' : 'SOLD OUT'}
                </button>

                {/* This part was also rendering */}
                <div className="reviews-section">
                    <h3>Customer Reviews</h3>
                    {reviews && reviews.length > 0 ? (
                        <div className="reviews-list">
                            {reviews.map((review) => (
                                <div key={review._id} className="review-card">
                                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                                        <Avatar sx={{ bgcolor: '#e67e22', width: 32, height: 32, fontSize: '0.9rem' }}>
                                            {review.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {review.name}
                                        </Typography>
                                        <Rating value={review.rating} size="small" readOnly />
                                    </Box>
                                    <Typography variant="body2" color="textSecondary" sx={{ pl: 6 }}>
                                        {review.comment}
                                    </Typography>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-reviews-text">No reviews yet. Be the first!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;