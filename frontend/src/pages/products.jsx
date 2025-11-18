// src/pages/products.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Loader from '../layout/Loader.jsx'; 
import ProductCard from '../components/productcard.jsx';
import ProductFilters from '../components/ProductFilters.jsx'; 
import '../css/products.css';
import '../context/CartContext.jsx'

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); 

    const [filters, setFilters] = useState({
        price: [1, 5000], 
        category: '',
        rating: 0
    });

    const backendUrl = import.meta.env.VITE_APP_API_URL;
    const resPerPage = 10; 

    const fetchProducts = useCallback(async (isInitialLoad = true) => {
        setLoading(true);
        setError(null);

        const params = {
            page: isInitialLoad ? 1 : page,
            limit: resPerPage,
        };

        if (searchTerm) {
            params.keyword = searchTerm;
        }

        if (filters.price[0] !== 1 || filters.price[1] !== 5000) {
            params['price[gte]'] = filters.price[0];
            params['price[lte]'] = filters.price[1];
        }
        if (filters.category) {
            params.category = filters.category;
        }
        if (filters.rating > 0) {
            params['ratings[gte]'] = filters.rating;
        }

        const query = new URLSearchParams(params).toString();

        try {
            const { data } = await axios.get(`${backendUrl}/products?${query}`); 
            
            const newProducts = data.products;
            
            if (isInitialLoad) {
                setProducts(newProducts);
            } else {
                setProducts((prevProducts) => [...prevProducts, ...newProducts]);
            }
            
            setHasMore(newProducts.length === resPerPage);
            setLoading(false);

        } catch (err) {
            console.error("Fetch Products Error:", err);
            setError("Failed to load products. Please check server.");
            setLoading(false);
            setHasMore(false);
        }
    }, [page, filters, searchTerm, backendUrl]);

    useEffect(() => {
        setPage(1);
        fetchProducts(true);
    }, [filters, searchTerm, fetchProducts]);

    const handleScroll = useCallback(() => {
        if (window.innerHeight + document.documentElement.scrollTop >= 
            document.documentElement.offsetHeight - 100 && hasMore && !loading) {
            setPage((prevPage) => prevPage + 1);
        }
    }, [hasMore, loading]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // --- Search Handlers ---
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setFilters({ price: [1, 5000], category: '', rating: 0 }); 
        setSearchTerm(searchKeyword);
    };

    const handleClearSearch = () => {
        if (searchKeyword || searchTerm) {
            setSearchKeyword(''); 
            setSearchTerm('');
        }
    };

    if (error && products.length === 0) return (
        <div className="product-error-container"><h2>{error}</h2></div>
    );

return (
        <div className="products-page-wrapper">

            <div className="products-filters-sidebar">
                <ProductFilters 
                    filters={filters} 
                    setFilters={setFilters} 
                />
            </div>

            <div className="products-main-content">
                <h1 className="page-title">Shop All Pet Supplies</h1>
                
                <form onSubmit={handleSearchSubmit} className="product-search-form">
                    <input 
                        type="text" 
                        placeholder="Search for toys, food, or grooming services..." 
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary search-btn">Search</button>

                    {(searchKeyword || searchTerm) && (
                        <button type="button" onClick={handleClearSearch} className="btn btn-secondary clear-btn">
                            Clear
                        </button>
                    )}
                </form>

                <div className="products-list-container"> 
                    <div className="products-grid">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                    
                    {loading && <Loader />}
                    
                    {!loading && products.length === 0 && !error && (
                        <p className="end-message">No products match your current filters. Try adjusting them.</p>
                    )}
                    
                    {!loading && !hasMore && products.length > 0 && (
                        <p className="end-message">You've reached the end of the line! 🐾</p>
                    )}
                </div>
            </div>
            
        </div>
    );
};

export default Products;