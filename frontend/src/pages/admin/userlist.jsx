// src/pages/admin/userlist.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx'; 
import axios from 'axios';
import Loader from '../../layout/Loader.jsx'; 
import { 
    Box, Typography, Paper, Button, Chip, TextField, 
    InputAdornment, Table, TableBody, TableCell, TableHead, TableRow, 
    Select, MenuItem, FormControl, Dialog, DialogActions, DialogContent, 
    DialogContentText, DialogTitle // ⬅️ Added Dialog components
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search'; 
import { toast } from 'react-toastify'; // ⬅️ Added Toastify

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // ⭐️ NEW STATE for confirmation modal ⭐️
    const [openConfirm, setOpenConfirm] = useState(false);
    const [actionTarget, setActionTarget] = useState(null); // Stores { userId, field, value, userName }

    const { idToken, mongoUser } = useAuth();
    const backendUrl = import.meta.env.VITE_APP_API_URL;
    
    // --- Core Data Fetch ---
    const fetchUsers = async () => {
        if (!mongoUser) { 
            setLoading(false);
            return;
        }
        try {
            const { data } = await axios.get(`${backendUrl}/admin/users`, {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });
            setUsers(data.users); 
            setFilteredUsers(data.users); 
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch users.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (idToken && mongoUser?._id) fetchUsers(); 
    }, [idToken, mongoUser]);

    // --- Search Functionality ---
    useEffect(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const results = users.filter(user =>
            user.name.toLowerCase().includes(lowercasedSearchTerm) ||
            user.email.toLowerCase().includes(lowercasedSearchTerm) ||
            user.role.toLowerCase().includes(lowercasedSearchTerm)
        );
        setFilteredUsers(results);
    }, [searchTerm, users]); 

    // --- Role and Status Update Handler ---
    
    // ⭐️ 1. Open confirmation modal ⭐️
    const handleUpdateClick = (userId, field, value, userName) => {
        if (userId === mongoUser._id) {
            toast.error(`Error: Cannot change your own active session.`);
            return;
        }
        setActionTarget({ userId, field, value, userName });
        setOpenConfirm(true);
    };

    const handleCloseConfirm = () => {
        setOpenConfirm(false);
        setActionTarget(null);
    };

    // ⭐️ 2. Run update after confirmation ⭐️
    const confirmUpdate = async () => {
        if (!actionTarget) return;
        
        const { userId, field, value, userName } = actionTarget;

        const updateData = { [field]: value };

        try {
            await axios.put(`${backendUrl}/admin/user/${userId}`, updateData, {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });
            
            // Show toast notification on success
            toast.success(`User ${userName}'s ${field} updated to ${value}.`);
            
            // Refresh local state to reflect change immediately
            setUsers(prevUsers => prevUsers.map(user => 
                user._id === userId ? { ...user, [field]: value } : user
            ));
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed.");
            fetchUsers(); // Force refresh on failure
        } finally {
            handleCloseConfirm();
        }
    };
    
    const getRoleColor = (role) => (role === 'admin' ? 'error' : 'default');

    if (loading) return <Loader />;

    return (
        <Box sx={{ p: 3 }}>
            {/* ⭐️ FIX: Swapped Title and Search Bar ⭐️ */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                
                <Typography variant="h4" sx={{ flexGrow: 1 }}>User List ({filteredUsers.length})</Typography>

                <TextField
                    variant="outlined"
                    placeholder="Search users..."
                    size="small"
                    value={searchTerm}
                    // ⭐️ FIX: Corrected typo 'e.g.target.value' ⭐️
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

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ overflowX: 'auto' }}>
                    <Table className="admin-table">
                        <TableHead sx={{ bgcolor: '#f5f5ff' }}>
                            <TableRow>
                                <TableCell sx={{ width: '5%' }}>Avatar</TableCell>
                                <TableCell sx={{ width: '20%' }}>Name</TableCell>
                                <TableCell sx={{ width: '25%' }}>Email</TableCell>
                                <TableCell sx={{ width: '15%' }}>Status</TableCell>
                                <TableCell sx={{ width: '15%' }}>Role</TableCell>
                                <TableCell sx={{ width: '20%' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell>
                                        <img 
                                            src={user.avatar?.url || '/default-avatar.png'} 
                                            alt={user.name} 
                                            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                    </TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={user.active ? 'Active' : 'Deactivated'} 
                                            color={user.active ? 'success' : 'error'} 
                                            size="small" 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <FormControl size="small" sx={{ minWidth: 100 }}>
                                            <Select
                                                value={user.role}
                                                // ⭐️ 3. Update onClick to open modal ⭐️
                                                onChange={(e) => handleUpdateClick(user._id, 'role', e.target.value, user.name)}
                                                disabled={user._id === mongoUser._id} 
                                            >
                                                <MenuItem value="user">USER</MenuItem>
                                                <MenuItem value="admin">ADMIN</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                    <TableCell>
                                        <Button 
                                            variant="outlined" 
                                            size="small" 
                                            color={user.active ? 'error' : 'success'}
                                            // ⭐️ 3. Update onClick to open modal ⭐️
                                            onClick={() => handleUpdateClick(user._id, 'active', !user.active, user.name)}
                                            disabled={user._id === mongoUser._id} 
                                        >
                                            {user.active ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredUsers.length === 0 && (
                         <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>No users found matching your search.</Typography>
                    )}
                </Box>
            </Paper>

            {/* ⭐️ 4. Add the Confirmation Dialog JSX ⭐️ */}
            <Dialog
                open={openConfirm}
                onClose={handleCloseConfirm}
            >
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to change the 
                        <strong> {actionTarget?.field}</strong> for <strong>{actionTarget?.userName}</strong> to 
                        <strong> {String(actionTarget?.value)}</strong>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirm} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={confirmUpdate} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserList;