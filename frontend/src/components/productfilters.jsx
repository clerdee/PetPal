import React, { useState, useEffect } from 'react';
import { Slider, Select, MenuItem, FormControl, InputLabel, Box, Typography, Rating, Button } from '@mui/material'; 
import '../css/productfilters.css';

const categories = [
    'Food', 'Grooming', 'Toys', 'Service', 'Clothes', 
];

const ProductFilters = ({ filters, setFilters }) => {
    
    // Add local state for the slider's visual value
    const [localMinPrice, setLocalMinPrice] = useState(filters.price[0]);

    // Sync local state when filters are cleared externally (e.g., "Clear Filters")
    useEffect(() => {
        setLocalMinPrice(filters.price[0]);
    }, [filters.price[0]]);
    
    // Helper to handle general field changes (like Category select)
    const handleChange = (e) => {
        setFilters(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Updates the slider's visual position as you drag
    const handlePriceSliderChange = (event, newValue) => {
        setLocalMinPrice(newValue);
    };

    // Updates the *actual* filter state when you let go of the slider
    const handlePriceChangeCommitted = (event, newValue) => {
        setFilters(prev => ({
            ...prev,
            price: [newValue, prev.price[1]] // Only update the min price
        }));
    };
    
    // Helper to handle Rating clicks
    const handleRatingChange = (event, newValue) => {
        setFilters(prev => ({
            ...prev,
            rating: newValue || 0 // Set to 0 if cleared (by clicking the same rating)
        }));
    };
    
    // Helper for the "Clear Filters" button
    const clearFilters = () => {
        setFilters({ price: [1, 5000], category: '', rating: 0 });
    };

    return (
        <div className="filter-panel">
            <Typography variant="h6" gutterBottom sx={{ p: 1.5, pb: 0 }}>
                Filter Products
            </Typography>
            
            {/* 1. PRICE FILTER (Updated to MUI Slider) */}
            <Box className="filter-group" sx={{ px: 2, pt: 1 }}>
                <Typography gutterBottom variant="subtitle1" component="h3">
                    Price Range
                </Typography>
                <Slider
                    value={localMinPrice} // Use local state for visual value
                    onChange={handlePriceSliderChange} // Update visual value on drag
                    onChangeCommitted={handlePriceChangeCommitted} // Update filters on mouse up
                    aria-labelledby="price-range-slider"
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `₱${value}`}
                    step={50}
                    min={1}
                    max={5000}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: -1 }}>
                    <Typography variant="caption">₱{localMinPrice}</Typography>
                    <Typography variant="caption">₱5000+</Typography>
                </Box>
            </Box>

            {/* 2. CATEGORY FILTER (Updated to MUI Select) */}
            <Box className="filter-group" sx={{ px: 1.5, mt: 2 }}>
                <FormControl fullWidth>
                    <InputLabel id="category-filter-label">Category</InputLabel>
                    <Select
                        labelId="category-filter-label"
                        id="category-filter-select"
                        name="category"
                        value={filters.category}
                        label="Category"
                        onChange={handleChange}
                    >
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map((cat) => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            
            {/* 3. RATINGS FILTER (Updated to MUI Rating) */}
            <Box className="filter-group" sx={{ px: 1.5, mt: 3, textAlign: 'center' }}>
                <Typography gutterBottom variant="subtitle1" component="h3">
                    Customer Ratings
                </Typography>
                <Rating
                    name="rating-filter"
                    value={filters.rating}
                    onChange={handleRatingChange}
                    size="large"
                />
                {filters.rating > 0 && (
                    <Button 
                        size="small" 
                        onClick={() => handleRatingChange(null, 0)} 
                        sx={{ display: 'block', mt: 1, textTransform: 'none', mx: 'auto' }}
                    >
                        Clear Rating
                    </Button>
                )}
            </Box>

            {/* 4. CLEAR FILTERS BUTTON */}
            <Box sx={{ p: 1.5, mt: 2 }}>
                <Button 
                    className="btn-secondary btn-clear" // Keep old class if needed
                    onClick={clearFilters}
                    variant="outlined"
                    fullWidth
                >
                    Clear Filters
                </Button>
            </Box>
        </div>
    );
};

export default ProductFilters;