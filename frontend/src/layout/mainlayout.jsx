// src/layout/MainLayout.jsx
import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

const MainLayout = () => {
    // 1. Get the current URL path
    const location = useLocation();
    
    // 2. Check if the path starts with /admin
    const isAdminRoute = location.pathname.startsWith('/admin');

    // 3. Render the correct layout
    if (isAdminRoute) {
        return <Outlet />; 
    }

    // Default Layout (Public/User)
    return (
        <>
            <Header />
            <main>
                {/* All non-admin routes render here */}
                <Outlet /> 
            </main>
            <Footer />
        </>
    );
};

export default MainLayout;