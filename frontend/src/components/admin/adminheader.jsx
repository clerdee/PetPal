// src/components/admin/adminheader.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth'; 
import { auth } from '../../firebase.js'; 
import '../../css/adminlayout.css';
import { Box, Avatar, Button, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

const AdminHeader = () => {
    const { mongoUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Admin Logout Failed:", error);
        }
    };

    return (
        <div className="admin-header">
            <Box sx={{ flexGrow: 1 }}>
            </Box>

            <div className="admin-user-info">
                <Avatar src={mongoUser?.avatar?.url} alt={mongoUser?.name} sx={{ width: 32, height: 32, mr: 1 }} />
                <Typography component="span" sx={{ fontWeight: 500 }}>{mongoUser?.name}</Typography>
                <Button 
                    onClick={handleLogout} 
                    className="admin-logout-btn" 
                    title="Logout"
                    startIcon={<LogoutIcon />}
                    sx={{ ml: 2, color: '#555' }}
                >
                    Logout
                </Button>
            </div>
        </div>
    );
};

export default AdminHeader;