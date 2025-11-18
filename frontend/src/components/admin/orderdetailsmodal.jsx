// src/components/admin/orderdetailsmodal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import axios from 'axios';
import Loader from '../../layout/Loader.jsx';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, 
    Typography, Box, Select, MenuItem, InputLabel, FormControl, 
    List, ListItem, ListItemText, ListItemIcon, Chip, Divider, Paper, 
    Table, TableBody, TableRow, TableCell, TableContainer 
} from '@mui/material'; 
import { toast } from 'react-toastify'; 

const OrderDetailsModal = ({ orderId, onClose }) => {
    const { idToken } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);

    const backendUrl = import.meta.env.VITE_APP_API_URL;

    // --- 1. Fetch Order Data ---
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/admin/order/${orderId}`, {
                    headers: { 'Authorization': `Bearer ${idToken}` }
                });
                setOrder(data.order);
                setStatus(data.order.orderStatus);
                setLoading(false);
            } catch (err) {
                console.error("Fetch Error:", err);
                setError("Failed to fetch order details.");
                setLoading(false);
            }
        };
        if (orderId) fetchOrder();
    }, [orderId, idToken]);

    // --- 2. Update Status Handler (with Toastify) ---
    const updateStatusHandler = async () => {
        setIsUpdating(true);
        try {
            await axios.put(
                `${backendUrl}/admin/order/${orderId}`,
                { status: status },
                { headers: { 'Authorization': `Bearer ${idToken}` } }
            );

            toast.success(`Status updated to ${status}. Email sent.`, {
                position: "bottom-right"
            });
            onClose(); 
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed.", {
                position: "bottom-right"
            });
        } finally {
            setIsUpdating(false);
        }
    };
    
    if (loading) return <Dialog open fullWidth><Box p={4}><Loader /></Box></Dialog>;
    if (error) return <Dialog open onClose={onClose}><Box p={4}><Typography color="error">{error}</Typography></Box></Dialog>;
    if (!order) return null;

    const isDelivered = order.orderStatus === 'Delivered';

    const paymentStatusLabel = order.paymentInfo.status === 'succeeded' ? 'Approved' : 'Not Approved';
    const paymentStatusColor = paymentStatusLabel === 'Approved' ? 'success' : 'error';
    
    let paymentMethod = order.paymentInfo.cardType;
    if (paymentMethod === 'E-Wallet') {
        paymentMethod = `E-Wallet (${order.paymentInfo.billingName || 'GCASH/MAYA'})`;
    } else if (paymentMethod === 'Credit/Debit Card') {
        paymentMethod = `Card ending in ${order.paymentInfo.cardLast4 || 'XXXX'}`;
    }

    const shippingInfo = order.shippingInfo || {};

    return (
        <Dialog open onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h6">Order #{order._id}</Typography>
                        <Typography variant="caption" color="textSecondary">
                            Placed on: {new Date(order.createdAt).toLocaleString()}
                        </Typography>
                    </Box>
                    <Chip 
                        label={order.orderStatus} 
                        color={status === 'Delivered' ? 'success' : (status === 'Shipped' ? 'info' : 'warning')} 
                        variant="outlined"
                    />
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                {/* ⭐️ FIX: Replaced <Grid container> with <Box> ⭐️ */}
                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
                    
                    {/* LEFT COLUMN: Shipping, Customer, & Items */}
                    <Box flex={2}>
                        
                        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f9f9f9', mb: 3, border: '1px solid #eee' }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                                📦 Shipping Info
                            </Typography>
                            {/* Use Flexbox for a robust 2-column layout */}
                            <Box display="flex" flexDirection="column" gap={1.5}>
                                <Box display="flex" gap={2}>
                                    <Box flex={1}>
                                        <Typography variant="caption" color="textSecondary">Recipient Name</Typography>
                                        <Typography variant="body1" fontWeight="500">{shippingInfo.recipientName}</Typography>
                                    </Box>
                                    <Box flex={1}>
                                        <Typography variant="caption" color="textSecondary">Phone Number</Typography>
                                        <Typography variant="body1" fontWeight="500">{shippingInfo.phoneNumber}</Typography>
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">Shipping Address</Typography>
                                    <Typography variant="body1">{shippingInfo.address}</Typography>
                                </Box>
                                <Box display="flex" gap={2}>
                                    <Box flex={1}>
                                        <Typography variant="caption" color="textSecondary">City</Typography>
                                        <Typography variant="body1">{shippingInfo.city}</Typography>
                                    </Box>
                                    <Box flex={1}>
                                        <Typography variant="caption" color="textSecondary">Country</Typography>
                                        <Typography variant="body1">{shippingInfo.country}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Order Items List */}
                        <Typography variant="h6" gutterBottom>Items Ordered ({order.orderItems.length})</Typography>
                        <List dense sx={{ border: '1px solid #eee', borderRadius: 2, mb: 2 }}>
                            {order.orderItems.map((item) => (
                                <ListItem key={item.productId} divider>
                                    <ListItemIcon>
                                        <img src={item.image} alt={item.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={item.name} 
                                        secondary={
                                            <Typography variant="body2" color="textSecondary">
                                                {`₱${item.price.toFixed(2)} x ${item.quantity}`}
                                            </Typography>
                                        } 
                                    />
                                    <Typography variant="body1" fontWeight="bold">
                                        ₱{(item.price * item.quantity).toFixed(2)}
                                    </Typography>
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    {/* RIGHT COLUMN: Payment & Totals */}
                    <Box flex={1} display="flex" flexDirection="column">
                        
                        <Paper elevation={0} sx={{ p: 2, bgcolor: '#e3f2fd', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                                💳 Payment Info
                            </Typography>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2">Method:</Typography>
                                <Typography variant="body2" fontWeight="bold">{paymentMethod}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">Status:</Typography>
                                <Chip label={paymentStatusLabel} color={paymentStatusColor} size="small" />
                            </Box>
                        </Paper>

                        <Box 
                            p={2} 
                            borderRadius={2} 
                            sx={{ 
                                border: '1px solid #ddd', 
                                bgcolor: '#fff' 
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Order Summary</Typography>
                            <TableContainer>
                                <Table size="small" padding="none">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell sx={{ borderBottom: 'none', py: 0.5, color: '#666' }}>Subtotal</TableCell>
                                            <TableCell align="right" sx={{ borderBottom: 'none', py: 0.5 }}>₱{order.itemsPrice.toFixed(2)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ borderBottom: 'none', py: 0.5, color: '#666' }}>Shipping Fee</TableCell>
                                            <TableCell align="right" sx={{ borderBottom: 'none', py: 0.5 }}>₱{order.shippingPrice.toFixed(2)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ borderBottom: '1px solid #eee', py: 0.5, color: '#666' }}>VAT (5%)</TableCell>
                                            <TableCell align="right" sx={{ borderBottom: '1px solid #eee', py: 0.5 }}>₱{order.taxPrice.toFixed(2)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ borderBottom: 'none', pt: 2 }}>
                                                <Typography variant="subtitle1" fontWeight="bold">Grand Total</Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={{ borderBottom: 'none', pt: 2 }}>
                                                <Typography variant="h5" color="primary" fontWeight="bold">
                                                    ₱{order.totalPrice.toFixed(2)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>

                        {/* Status Update Control */}
                        <Box mt="auto" pt={3}>
                            <Typography variant="subtitle2" gutterBottom>Update Order Status</Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={status}
                                        label="Status"
                                        onChange={(e) => setStatus(e.target.value)}
                                        disabled={isDelivered || isUpdating}
                                    >
                                        <MenuItem value="Processing">Processing</MenuItem>
                                        <MenuItem value="Shipped">Shipped</MenuItem>
                                        <MenuItem value="Delivered">Delivered</MenuItem>
                                    </Select>
                                </FormControl>
                                
                                <Button 
                                    fullWidth
                                    variant="contained" 
                                    color="primary"
                                    onClick={updateStatusHandler}
                                    disabled={isDelivered || isUpdating || status === order.orderStatus}
                                >
                                    {isUpdating ? 'Sending Email...' : 'Update & Notify User'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
                <Button onClick={onClose} color="inherit">Close Window</Button>
            </DialogActions>
        </Dialog>
    );
};

export default OrderDetailsModal;