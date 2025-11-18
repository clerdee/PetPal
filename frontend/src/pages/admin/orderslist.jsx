// src/pages/admin/orderslist.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../../layout/Loader.jsx'; 
import OrderDetailsModal from '../../components/admin/orderdetailsmodal.jsx';
import { 
    Box, Typography, Paper, Button, Chip, TextField, 
    InputAdornment, Table, TableBody, TableCell, TableHead, TableRow,
    TableContainer, Dialog, DialogActions, DialogContent, 
    DialogContentText, DialogTitle, Checkbox 
} from '@mui/material'; 
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';

const OrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); 
    const [openBulkConfirm, setOpenBulkConfirm] = useState(false);
    const { idToken } = useAuth();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_APP_API_URL;

    // --- Data Fetching and Handlers ---
    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/admin/orders`, {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });
            const sortedOrders = data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sortedOrders);
            setFilteredOrders(sortedOrders);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch orders.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (idToken) fetchOrders();
    }, [idToken]);

    useEffect(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const results = orders.filter(order =>
            order._id.toLowerCase().includes(lowercasedSearchTerm) ||
            (order.user?.name || '').toLowerCase().includes(lowercasedSearchTerm) ||
            order.orderStatus.toLowerCase().includes(lowercasedSearchTerm)
        );
        setFilteredOrders(results);
    }, [searchTerm, orders]);

    const openOrderDetails = (id) => {
        setSelectedOrderId(id);
        setShowModal(true);
    };
    
    const closeModal = () => {
        setSelectedOrderId(null);
        setShowModal(false);
        fetchOrders(); 
    };

    const handleDeleteClick = (order) => {
        setDeleteTarget(order);
        setOpenConfirm(true);
    };

    const handleCloseConfirm = () => {
        setOpenConfirm(false);
        setDeleteTarget(null);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await axios.delete(`${backendUrl}/admin/order/${deleteTarget._id}`, {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });
            toast.success(`Order #${deleteTarget._id.substring(0, 8)} deleted.`);
            fetchOrders(); 
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete order.");
        } finally {
            handleCloseConfirm();
        }
    };
    
    // --- Bulk Select Handlers ---
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = filteredOrders.map(o => o._id);
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (e, id) => {
        if (e.target.checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        }
    };

    const handleBulkDeleteClick = () => {
        if (selectedIds.length === 0) return;
        setOpenBulkConfirm(true); 
    };

    const confirmBulkDelete = async () => {
        try {
            await axios.delete(`${backendUrl}/admin/orders/delete-bulk`, {
                data: { ids: selectedIds }, 
                headers: { 'Authorization': `Bearer ${idToken}` }
            });

            toast.success(`${selectedIds.length} orders deleted successfully!`);
            setSelectedIds([]); 
            fetchOrders(); 

        } catch (err) {
            toast.error(err.response?.data?.message || "Bulk deletion failed.");
        } finally {
            setOpenBulkConfirm(false); 
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'success';
            case 'Processing': return 'warning';
            case 'Shipped': return 'info';
            case 'Cancelled': return 'error';
            default: return 'default';
        }
    };

    if (loading) return <Loader />;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ flexGrow: 1 }}>Order Management ({filteredOrders.length})</Typography>
                <TextField
                    variant="outlined"
                    placeholder="Search by ID, Customer, or Status..."
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
                    sx={{ width: '300px' }}
                />
            </Box>

            {error && <Typography color="error">{error}</Typography>}

            {selectedIds.length === 1 && (
                <Box className="bulk-actions-bar" sx={{ mb: 2, p: 2, bgcolor: '#f0f0f0', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>{selectedIds.length} item selected</Typography>
                    <Button 
                        color="error"
                        variant="outlined"
                        onClick={() => handleDeleteClick(orders.find(o => o._id === selectedIds[0]))}
                    >
                        Delete
                    </Button>
                </Box>
            )}
            {selectedIds.length >= 2 && (
                <Box className="bulk-actions-bar" sx={{ mb: 2, p: 2, bgcolor: '#fff0f0', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography color="error.main">{selectedIds.length} items selected</Typography>
                    <Button 
                        color="error" 
                        variant="contained"
                        onClick={handleBulkDeleteClick}
                    >
                        Bulk Delete
                    </Button>
                </Box>
            )}

            <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead sx={{ "& .MuiTableCell-root": { bgcolor: '#f5f5f5', fontWeight: 'bold' } }}>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        color="primary"
                                        indeterminate={selectedIds.length > 0 && selectedIds.length < filteredOrders.length}
                                        checked={filteredOrders.length > 0 && selectedIds.length === filteredOrders.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell sx={{ width: '10%' }}>Order ID</TableCell>
                                <TableCell sx={{ width: '10%' }}>Status</TableCell>
                                <TableCell sx={{ width: '15%' }}>Customer</TableCell>
                                <TableCell sx={{ width: '10%' }}>Total Items</TableCell>
                                <TableCell sx={{ width: '15%' }}>Amount</TableCell>
                                <TableCell sx={{ width: '15%' }}>Date & Time</TableCell>
                                <TableCell sx={{ width: '20%' }}>Actions</TableCell> 
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredOrders.map((order, index) => (
                                <TableRow hover key={order._id}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            checked={selectedIds.includes(order._id)}
                                            onChange={(e) => handleSelectOne(e, order._id)}
                                        />
                                    </TableCell>
                                    <TableCell>{order._id.substring(0, 8)}...</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={order.orderStatus} 
                                            color={getStatusColor(order.orderStatus)} 
                                            size="small" 
                                        />
                                    </TableCell>
                                    <TableCell>{order.user?.name || 'N/A'}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        {order.orderItems.reduce((acc, item) => acc + item.quantity, 0)}
                                    </TableCell>
                                    <TableCell>₱{order.totalPrice.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#888' }}>
                                                {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button 
                                                variant="contained" 
                                                size="small" 
                                                onClick={() => openOrderDetails(order._id)}
                                            >
                                                Details
                                            </Button>
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                color="error"
                                                onClick={() => handleDeleteClick(order)}
                                                startIcon={<DeleteIcon />}
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                {filteredOrders.length === 0 && (
                     <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>No orders found.</Typography>
                )}
            </Paper>

            {showModal && (
                <OrderDetailsModal orderId={selectedOrderId} onClose={closeModal} />
            )}

            <Dialog
                open={openConfirm}
                onClose={handleCloseConfirm}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to permanently delete this order?
                        <br />
                        <strong>Order ID: {deleteTarget?._id.substring(0, 8)}...</strong>
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

            <Dialog
                open={openBulkConfirm}
                onClose={() => setOpenBulkConfirm(false)}
            >
                <DialogTitle>Confirm Bulk Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to permanently delete these 
                        <strong> {selectedIds.length} orders</strong>? 
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBulkConfirm(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={confirmBulkDelete} color="error" autoFocus>
                        Delete All
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default OrdersList;