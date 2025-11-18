import React, { useState } from 'react';
import { useForm } from 'react-hook-form'; 
import { yupResolver } from '@hookform/resolvers/yup'; 
import * as yup from 'yup'; 
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../firebase';
import axios from 'axios';
import '../css/modal.css';
import { useNavigate } from 'react-router-dom';

// ⭐️ 1. Import the icons
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

// Define Validation Schema (No change)
const schema = yup.object().shape({
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup.string().required("Password is required").min(6, "Password must be at least 6 chars"),
});

// ⭐️ 2. Add 'onSwitch' prop to handle changing to Register
const LoginModal = ({ onClose, onSwitch }) => {
    const navigate = useNavigate();
    const [submitError, setSubmitError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    // Handle Submit (No change)
    const onSubmit = async (data) => {
        setSubmitError(null);
        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;
            const idToken = await user.getIdToken();
            
            const backendUrl = import.meta.env.VITE_APP_API_URL;
            const response = await axios.post(
                `${backendUrl}/auth/create-or-update-user`, 
                { idToken }
            );

            const role = response.data.user.role;
            setIsLoading(false);
            onClose();

            if (role === 'admin') {
                await new Promise(resolve => setTimeout(resolve, 50)); 
                navigate('/admin/dashboard');
            } else {
                navigate('/profile');
            }

        } catch (error) {
            setIsLoading(false);
            console.error("Login Error:", error);
            if (error.code === 'auth/invalid-credential') {
                setSubmitError("Invalid email or password.");
            } else {
                setSubmitError("Login failed. Please try again.");
            }
        }
    };

    // Handle Social Login (No change in logic)
    const handleSocialLogin = async (provider) => {
        setSubmitError(null);
        setIsLoading(true);

        try {
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;
            const idToken = await user.getIdToken();

            const backendUrl = import.meta.env.VITE_APP_API_URL;
            const response = await axios.post(
                `${backendUrl}/auth/create-or-update-user`, 
                { idToken }
            );
            
            const role = response.data.user.role;
            setIsLoading(false);
            onClose();

            if (role === 'admin') {
                await new Promise(resolve => setTimeout(resolve, 50)); 
                navigate('/admin/dashboard');
            } else {
                navigate('/profile');
            }

        } catch (error) {
            setIsLoading(false);
            console.error("Social Login Error:", error);
            setSubmitError("Social login failed. Please try again.");
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                
                {/* ⭐️ 3. Updated Header */}
                <h2 className="modal-title">Sign In</h2>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="login-email">Email</label>
                        <input
                            type="email"
                            id="login-email"
                            {...register("email")} 
                        />
                        {errors.email && <p className="error-message">{errors.email.message}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">Password</label>
                        <input
                            type="password"
                            id="login-password"
                            {...register("password")}
                        />
                        {errors.password && <p className="error-message">{errors.password.message}</p>}
                    </div>
                    
                    {/* <div className="form-options">
                        <a href="#" className="forgot-password-link">Forgot Password?</a>
                    </div> */}
                    
                    {submitError && <p className="error-message server-error">{submitError}</p>}
                    
                    <button type="submit" className="btn btn-primary btn-full-width" disabled={isLoading}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="social-login-divider">
                    <span>or</span>
                </div>
                
                {/* ⭐️ 4. Updated Social Buttons with Icons */}
                <button 
                    className="btn btn-social btn-google" 
                    onClick={() => handleSocialLogin(googleProvider)}
                    disabled={isLoading}
                >
                    <FcGoogle className="social-icon" /> 
                    <span>Sign in with Google</span>
                </button>
                
                <button 
                    className="btn btn-social btn-facebook" 
                    onClick={() => handleSocialLogin(facebookProvider)}
                    disabled={isLoading}
                >
                    <FaFacebook className="social-icon" />
                    <span>Sign in with Facebook</span>
                </button>

                {/* ⭐️ 5. Add "Switch to Register" Link */}
                <div className="modal-switch">
                    Don't have an account? 
                    <button className="modal-switch-link" onClick={onSwitch}>
                        Create one
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LoginModal;