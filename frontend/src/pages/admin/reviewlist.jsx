// src/pages/admin/reviewslist.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import axios from 'axios';
import Loader from '../../layout/Loader.jsx';
import { 
    Box, Typography, Paper, Button, Rating, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Dialog, DialogActions, 
    DialogContent, DialogContentText, DialogTitle, TextField, InputAdornment 
} from '@mui/material'; 
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search'; 
import { toast } from 'react-toastify'; 

const ReviewsList = () => {
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { idToken } = useAuth();
    const backendUrl = import.meta.env.VITE_APP_API_URL;

    const [openConfirm, setOpenConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); 

    const fetchReviews = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/admin/reviews/all`, {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });
            setReviews(data.reviews);
            setFilteredReviews(data.reviews); 
            setLoading(false);
        } catch (error) {
            console.error("Fetch Error", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (idToken) fetchReviews();
    }, [idToken]);

    useEffect(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const results = reviews.filter(review =>
            (review.product?.name || '').toLowerCase().includes(lowercasedSearchTerm) ||
            (review.user?.name || '').toLowerCase().includes(lowercasedSearchTerm) ||
            review.comment.toLowerCase().includes(lowercasedSearchTerm)
        );
        setFilteredReviews(results);
    }, [searchTerm, reviews]);

    const handleDeleteClick = (reviewId, productId, productName, comment) => {
        setDeleteTarget({ reviewId, productId, productName, comment });
        setOpenConfirm(true);
    };

    const handleCloseConfirm = () => {
        setOpenConfirm(false);
        setDeleteTarget(null);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        
        const { reviewId, productId, comment } = deleteTarget; 

        try {
            await axios.delete(
                `${backendUrl}/admin/review?productId=${productId}&reviewId=${reviewId}`, 
                { headers: { 'Authorization': `Bearer ${idToken}` } }
            );
            
            toast.success(`Review "${comment.substring(0, 20)}..." deleted.`);
            fetchReviews(); 
        } catch (error) {
            toast.error("Failed to delete review");
        } finally {
            handleCloseConfirm(); 
        }
    };

    if (loading) return <Loader />;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ flexGrow: 1 }}>Reviews Management ({filteredReviews.length})</Typography>
                <TextField
                    variant="outlined"
                    placeholder="Search by product, user, or comment..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: '350px' }}
                />
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Review ID</TableCell>
                            <TableCell>Product</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Rating</TableCell>
                            <TableCell>Comment</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredReviews.map((review) => (
                            <TableRow key={review._id}>
                                <TableCell>{review._id.substring(0, 8)}...</TableCell>
                                <TableCell>{review.product?.name || 'N/A'}</TableCell>
                                <TableCell>{review.user?.name || 'N/A'}</TableCell>
                                <TableCell><Rating value={review.rating} size="small" readOnly /></TableCell>
                                <TableCell>{review.comment}</TableCell>
                                <TableCell>
                                    <Button 
                                        color="error" 
                                        startIcon={<DeleteIcon />}
                                        onClick={() => handleDeleteClick(review._id, review.product?._id, review.product?.name, review.comment)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredReviews.length === 0 && (
                            <TableRow><TableCell colSpan={6} align="center">No reviews found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Confirmation Dialog */}
            <Dialog
                open={openConfirm}
                onClose={handleCloseConfirm}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText component="div"> 
                        Are you sure you want to permanently delete this review?
                        <br />
                        This action cannot be undone.
                        <Box 
                            sx={{ 
                                mt: 2, p: 2, bgcolor: '#f9f9f9', 
                                border: '1px solid #eee', borderRadius: 1 
                            }}
                        >
                            <Typography variant="body2" component="strong" display="block">
                                <strong>Product:</strong> {deleteTarget?.productName || 'N/A'}
                            </Typography>
                            <Typography variant="body2" component="blockquote" sx={{ m: 0, mt: 1, pl: 1, borderLeft: '3px solid #ccc' }}>
                                <i>"{deleteTarget?.comment || 'N/A'}"</i>
                            </Typography>
                        </Box>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirm} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReviewsList;