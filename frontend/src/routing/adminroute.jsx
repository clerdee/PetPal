// src/routing/AdminRoute.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext.jsx'; 
import { Navigate } from 'react-router-dom';
import Loader from '../layout/Loader.jsx';

const AdminRoute = ({ children }) => {
    const { currentUser, mongoUser, loading } = useAuth();

    // console.log("ADMIN ROUTE CHECK:", {
    //     loading: loading,
    //     currentUser: !!currentUser, // Just show true/false
    //     mongoUser: mongoUser
    // });

    if (loading || !mongoUser) {
        return <Loader />;
    }

    if (!currentUser || mongoUser.role !== 'admin') {
        console.log("AdminRoute Access Denied: Not an admin or not logged in.");
        return <Navigate to="/" replace />;
    }

    return children;
};


export default AdminRoute;