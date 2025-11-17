// src/routing/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Navigate } from 'react-router-dom';
import Loader from '../layout/Loader.jsx'; // We'll use your existing loader

const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    // 1. Check if we are still loading the auth state
    //    (This prevents a "flash" where the user is briefly
    //    redirected to "/" before Firebase logs them in)
    if (loading) {
        return <Loader />;
    }

    // 2. If loading is done and there's NO user,
    //    redirect them to the home page.
    if (!currentUser) {
        // The 'replace' prop is important. It prevents the user
        // from hitting the "back" button and getting stuck
        // in a redirect loop.
        return <Navigate to="/" replace />;
    }

    // 3. If loading is done AND there IS a user...
    //    let them in. Render the child component (e.g., the Profile page).
    return children;
};

export default ProtectedRoute;