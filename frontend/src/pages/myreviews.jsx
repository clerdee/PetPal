import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, NavLink } from 'react-router-dom'; 
import axios from 'axios';
import Loader from '../layout/Loader.jsx';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, 
    TextField, Box, Rating, Typography,
    Accordion, AccordionSummary, AccordionDetails,
    List, ListItem, ListItemText, ListItemIcon 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { toast } from 'react-toastify';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import '../css/myreviews.css';


const MyReviews = () => {
    const [purchasedItems, setPurchasedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [existingReviewId, setExistingReviewId] = useState(null); 

    const { idToken, mongoUser } = useAuth(); 
    const backendUrl = import.meta.env.VITE_APP_API_URL;
    const navigate = useNavigate(); 

useEffect(() => {
const fetchPurchasedItems = async () => {

if (!idToken) {
            setLoading(false);
            return;
        }
try {
const { data } = await axios.get(`${backendUrl}/orders/me`, {
 headers: { 'Authorization': `Bearer ${idToken}` }
});

const deliveredOrders = data.orders.filter(order => order.orderStatus === 'Delivered');

const allReviewableItems = deliveredOrders.flatMap(order => 
order.orderItems.map(item => ({
 ...item,
orderId: order._id, 
orderDate: order.createdAt, 
 uniqueKey: `${order._id}-${item.productId}` 
}))
 );

 allReviewableItems.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

setPurchasedItems(allReviewableItems);
setLoading(false);
 } catch (err) {
console.error("Failed to fetch orders:", err);

            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError("Please sign in to see your reviews.");
            } else {
                setError("Could not load your purchased items.");
            }
setLoading(false);
 }
};
 
 fetchPurchasedItems();
}, [idToken, backendUrl]);

    const openReviewModal = async (item) => {
        setSelectedProduct(item);
        setRating(0); 
        setComment(''); 
        setIsEditMode(false);
        setExistingReviewId(null);
        setShowModal(true);

        try {
            const { data } = await axios.get(`${backendUrl}/reviews/${item.productId}`);
            const existingReview = data.reviews.find(r => r.user === mongoUser?._id);

            if (existingReview) {
                setRating(existingReview.rating);
                setComment(existingReview.comment);
                setExistingReviewId(existingReview._id); 
                setIsEditMode(true); 
            }
        } catch (error) {
            console.error("Error checking for existing review", error);
        }
    };

    const closeReviewModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    const handleReviewSubmit = async () => {
        if (rating === 0) return toast.error("Please select a star rating.", { position: "bottom-right" });
        if (!comment) return toast.error("Please leave a comment.", { position: "bottom-right" });
        
        const payload = {
            rating: rating,
            comment: comment,
            productId: selectedProduct?.productId
        };
        
        if (!payload.productId) {
            return toast.error("Could not find product ID.", { position: "bottom-right" });
        }
        
        try {
            await axios.put(
                `${backendUrl}/review`, 
                payload, 
                { headers: { 'Authorization': `Bearer ${idToken}` } }
            );

            toast.success(isEditMode ? "Review updated!" : "Review submitted!", {
                position: "bottom-right"
            });
            closeReviewModal();
            
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit review.", {
                position: "bottom-right"
            });
        }
    };

    const handleReviewDelete = async () => {
        if (!selectedProduct?.productId || !existingReviewId) {
            return toast.error("Error: Could not find review to delete.", {
                position: "bottom-right"
            });
        }
        
        try {
            await axios.delete(
                `${backendUrl}/review?productId=${selectedProduct.productId}&reviewId=${existingReviewId}`,
                { headers: { 'Authorization': `Bearer ${idToken}` } }
            );

            toast.success("Review deleted successfully.", {
                position: "bottom-right"
            });
            closeReviewModal();
            
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete review.", {
                position: "bottom-right"
            });
        }
    };

    if (loading) return <Loader />;

    // Group the flat array of items by their *purchase date*
    const groupedItems = purchasedItems.reduce((acc, item) => {
        // Create a user-friendly date key, e.g., "Tuesday, November 18, 2025"
        const dateKey = new Date(item.orderDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        if (!acc[dateKey]) {
            acc[dateKey] = []; // Create an array for this date
        }
        acc[dateKey].push(item);
        return acc;
    }, {});

    // Sort the groups by date (keys are date strings)
    const sortedGroupKeys = Object.keys(groupedItems).sort((a, b) => {
        return new Date(b) - new Date(a); // Sort descending (newest first)
    });

    return (
        // ⭐️ --- NEW WRAPPER FOR THE THREE-PANEL LAYOUT --- ⭐️
        <div className="reviews-page-wrapper">
            
            {/* --- LEFT SIDEBAR (e.g., Profile Navigation) --- */}
            <div className="reviews-sidebar-left">
                <Typography variant="h6" sx={{ padding: '16px', fontWeight: 700, borderBottom: '1px solid #eee' }}>
                    My Account
                </Typography>
                <List component="nav">
                    {/* <ListItem button component={NavLink} to="/profile">
                        <ListItemIcon><AccountCircleOutlinedIcon /></ListItemIcon>
                        <ListItemText primary="Profile Settings" />
                    </ListItem>
                    <ListItem button component={NavLink} to="/orders">
                        <ListItemIcon><ShoppingBagOutlinedIcon /></ListItemIcon>
                        <ListItemText primary="My Orders" />
                    </ListItem> */}
                    <ListItem button component={NavLink} to="/rate">
                        <ListItemIcon><RateReviewIcon /></ListItemIcon>
                        <ListItemText primary="To Rate" />
                    </ListItem>
                </List>
            </div>

            {/* --- MAIN CONTENT AREA (Reviews List) --- */}
            <div className="reviews-main-content">
                <div className="reviews-header-section">
                    <h1>My Reviews</h1>
                    <p>You can only review products that have been <strong>Delivered</strong>.</p>
                </div>
                {error && <p className="error-message">{error}</p>}
                
                <div className="review-items-list">
                    
                    {/* ⭐️ --- START MODIFICATION --- ⭐️ */}
                    {!idToken ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                            <h3>Please Log In</h3>
                            <p>You must be logged in to view and write reviews.</p>
                            <Button 
                                variant="contained" 
                                onClick={() => navigate('/login')}
                                sx={{ mt: 2, backgroundColor: '#e67e22', '&:hover': { backgroundColor: '#d35400' } }}
                            >
                                Login
                            </Button>
                        </div>
                    ) : purchasedItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                            <h3>No items to review yet.</h3>
                            <p>Once your orders are marked as "Delivered", they will appear here.</p>
                        </div>
                    ) : (
                    // ⭐️ --- END MODIFICATION --- ⭐️
                        sortedGroupKeys.map(dateKey => {
                            const items = groupedItems[dateKey];
                            return (
                                <Accordion 
                                    key={dateKey} 
                                    defaultExpanded 
                                    sx={{ 
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                                        '&:before': { display: 'none' },
                                        border: '1px solid #eee',
                                        marginBottom: '16px' // Space between accordions
                                    }}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                            Purchased on: {dateKey}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ padding: 0 }}>
                                        {items.map(item => (
                                            <div key={item.uniqueKey} className="review-item-card"> 
                                                <img 
                                                    src={item.image} 
                                                    alt={item.name} 
                                                    onClick={() => navigate(`/product/${item.productId}`)}
                                                    style={{ cursor: 'pointer' }}
                                                    title="View Product Details"
                                                />
                                                <div className="review-item-details">
                                                    <h4>{item.name}</h4>
                                                    <p className="review-order-id">
                                                        Order ID: #{item.orderId.substring(0, 8)}...
                                                    </p>
                                                    <p>Price: ₱{item.price.toFixed(2)}</p>
                                                </div>
                                                <Button 
                                                    variant="contained" 
                                                    onClick={() => openReviewModal(item)}
                                                    sx={{ backgroundColor: '#e67e22', '&:hover': { backgroundColor: '#d35400' } }}
                                                >
                                                    Rate / Edit Review
                                                </Button>
                                            </div>
                                        ))}
                                    </AccordionDetails>
                                </Accordion>
                            )
                        })
                    )}
                </div>
            </div>

            {/* --- RIGHT SIDEBAR (e.g., Help, Review Guidelines, Ads) --- */}
            <div className="reviews-sidebar-right">
                <Box sx={{ padding: '24px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: '16px' }}>
                        Review Guidelines
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555', marginBottom: '8px' }}>
                        Your feedback helps other pet owners!
                    </Typography>
                    <List dense>
                        <ListItem><ListItemText primary="1. Be honest and clear." /></ListItem>
                        <ListItem><ListItemText primary="2. Focus on the product's features." /></ListItem>
                        <ListItem><ListItemText primary="3. Avoid personal attacks or inappropriate content." /></ListItem>
                        <ListItem><ListItemText primary="4. Do not include external links." /></ListItem>
                    </List>
                    {/* <Button variant="outlined" sx={{ mt: 2, borderColor: '#e67e22', color: '#ffffffff', '&:hover': { borderColor: '#d35400', color: '#d35400' } }}>
                        Read Full Policy
                    </Button> */}
                </Box>
            </div>

<Dialog open={showModal} onClose={closeReviewModal} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {isEditMode ? `Edit Review for ${selectedProduct?.name}` : `Write a review for ${selectedProduct?.name}`}
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={3} sx={{ pt: 1 }}>
                        <Box>
                            <Typography component="legend">Your Rating:</Typography>
                            <Rating
                                name="product-rating"
                                value={rating}
                                onChange={(event, newValue) => {
                                    setRating(newValue || 0);
                                }}
                                size="large"
                            />
                        </Box>
                        <TextField
                            label="Your Comment"
                            multiline
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            variant="outlined"
                            fullWidth
                            placeholder="What did you like or dislike?"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between', padding: '16px 24px' }}> {/* Adjusted padding here */}
                    {isEditMode ? (
                        <Button 
                            onClick={handleReviewDelete} 
                            color="error" 
                            variant="outlined" 
                            startIcon={<DeleteOutline />} // Added a delete icon for clarity
                            sx={{
                                '&:hover': {
                                    backgroundColor: (theme) => theme.palette.error.light, // Lighter red on hover
                                    color: 'white',
                                    borderColor: (theme) => theme.palette.error.light
                                }
                            }}
                        >
                            Delete Review
                        </Button>
                    ) : (
                        <Box></Box> 
                    )}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={closeReviewModal} variant="text" sx={{ color: 'white' }}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleReviewSubmit} 
                            variant="contained" 
                            color="primary"
                            sx={{
                                backgroundColor: '#e67e22',
                            }}
                        >
                            {isEditMode ? "Update Review" : "Submit Review"}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default MyReviews;