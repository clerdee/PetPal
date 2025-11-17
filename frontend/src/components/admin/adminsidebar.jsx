// src/components/admin/adminsidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    Drawer, Box, List, ListItem, ListItemButton, 
    ListItemIcon, ListItemText, Toolbar 
} from '@mui/material'; 
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SettingsIcon from '@mui/icons-material/Settings';
import RateReviewIcon from '@mui/icons-material/RateReview';

// The main menu structure
const adminMenuItems = [
    { text: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
    { text: 'Products', path: '/admin/products', icon: <InventoryIcon /> },
    { text: 'Users', path: '/admin/users', icon: <PeopleIcon /> },
    { text: 'Orders', path: '/admin/orders', icon: <ShoppingCartIcon /> },
    { text: 'Reviews', path: '/admin/reviews', icon: <RateReviewIcon /> },
];

const AdminSidebar = ({ drawerWidth }) => {
    return (
        <Box
            component="nav"
            sx={{ width: drawerWidth, flexShrink: 0 }}
        >
            <Drawer // This is the persistent purple sidebar
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    '& .MuiDrawer-paper': { // Styling the actual paper component
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        // ⭐️ Custom Styling for the Purple Theme ⭐️
                        backgroundColor: '#5A4BDE', 
                        color: 'white',
                        borderRight: 'none',
                    },
                }}
                open
            >
                {/* Logo Area */}
                <Toolbar sx={{ justifyContent: 'center', height: '80px' }}>
                    <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        PetPal Admin
                    </Box>
                </Toolbar>
                
                {/* Main Navigation List */}
                <List sx={{ mt: 2 }}>
                    {adminMenuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                component={NavLink} // Use NavLink for routing and active state
                                to={item.path}
                                sx={{
                                    '&.active': { // Target the active NavLink state
                                        backgroundColor: 'white',
                                        color: '#5A4BDE',
                                        fontWeight: 'bold',
                                        '& .MuiListItemIcon-root': {
                                            color: '#5A4BDE',
                                        },
                                    },
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ color: 'inherit' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                
                {/* Separator and Profile Setup Footer */}
                <Box sx={{ flexGrow: 1 }} /> {/* Pushes footer down */}
                <List sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.3)', py: 2 }}>
                    <ListItem disablePadding>
                        <ListItemButton>
                            <ListItemIcon sx={{ color: 'inherit' }}>
                                <SettingsIcon />
                            </ListItemIcon>
                            <ListItemText primary="Account Setting" />
                        </ListItemButton>
                    </ListItem>
                    {/* Placeholder for Profile Setup completion badge */}
                    <Box sx={{ p: 2, textAlign: 'center', fontSize: '0.9rem' }}>
                         PETPAL PH
                    </Box>
                </List>
            </Drawer>
        </Box>
    );
};

export default AdminSidebar;