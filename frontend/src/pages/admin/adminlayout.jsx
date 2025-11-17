// src/pages/admin/adminlayout.jsx
import React from 'react'; 
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import AdminHeader from '../../components/admin/adminheader.jsx';
import AdminSidebar from '../../components/admin/adminsidebar.jsx';

const drawerWidth = 250; 

const AdminLayout = () => {
    return (
        <Box sx={{ display: 'flex' }}> 
            <CssBaseline />
            <AdminSidebar drawerWidth={drawerWidth} /> 
            
            <Box
                component="main"
                sx={{ 
                    flexGrow: 1, 
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    backgroundColor: '#f9f9ffa0',
                    minHeight: '100vh',
                }}
            >

                <AdminHeader /> 

                <Outlet /> 
            </Box>
        </Box>
    );
};

export default AdminLayout;