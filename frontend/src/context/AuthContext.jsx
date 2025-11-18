// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // Your Firebase auth object
import axios from 'axios'; // ⬅️ We need axios now

// 1. Create the context
const AuthContext = createContext();

// 2. Create the custom hook
export const useAuth = () => {
    return useContext(AuthContext);
};

// 3. Create the Provider
export const AuthProvider = ({ children }) => {
    // Firebase state
    const [currentUser, setCurrentUser] = useState(null); 
    const [idToken, setIdToken] = useState(null);
    
    // ⭐️ --- NEW MONGODB STATE --- ⭐️
    const [mongoUser, setMongoUser] = useState(null);
    
    // Combined loading state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const backendUrl = import.meta.env.VITE_APP_API_URL;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // --- User is LOGGED IN ---
                let token;
                try {
                    // 1. Get the Firebase ID token
                    token = await user.getIdToken();
                    setIdToken(token);
                    console.log("✅ Firebase user authenticated:", user.email);

                    // ⭐️ --- NEW STEP: FETCH MONGODB USER --- ⭐️
                    // 2. Use the token to get our *real* user profile from our backend
                    try {
                        const { data } = await axios.get(`${backendUrl}/me`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        // 3. Store the MongoDB user (which has the .role)
                        setMongoUser(data.user);
                        console.log("✅ MongoDB user fetched:", data.user);
                    } catch (mongoError) {
                        // If MongoDB fetch fails, still allow cart to work with Firebase UID
                        console.warn("⚠️ MongoDB user fetch failed, will use Firebase UID:", mongoError.response?.status, mongoError.message);
                        setMongoUser(null);
                    }

                } catch (error) {
                    // This could fail if the token is bad
                    console.error("❌ Firebase token error:", error);
                    setIdToken(null);
                    setMongoUser(null);
                }
            } else {
                // --- User is LOGGED OUT ---
                console.log("👋 User logged out");
                setIdToken(null);
                setMongoUser(null); // ⭐️ Clear the MongoDB user
            }
            
            // 4. We're done loading, whether we succeeded or failed
            setLoading(false);
        });

        // Cleanup
        return unsubscribe;
    }, []); // Empty array, runs once on app load

    // The new value object includes our mongoUser
    const value = {
        currentUser,  // The Firebase user (for auth)
        idToken,      // The JWT (for API requests)
        mongoUser,    // The MongoDB user (for app data like roles)
        loading       // The combined loading state
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};