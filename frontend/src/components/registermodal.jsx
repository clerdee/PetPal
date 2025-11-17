import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
// ⭐️ 1. Import new firebase functions & providers
import { 
    createUserWithEmailAndPassword, 
    updateProfile,
    signInWithPopup 
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../firebase'; 
import axios from 'axios';
import '../css/modal.css';
import { useNavigate } from 'react-router-dom'; 

// ⭐️ 2. Import icons (This is likely what's missing)
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

// Define Schema
const schema = yup.object().shape({
    name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
});

// ⭐️ 3. Add 'onSwitch' prop
const RegisterModal = ({ onClose, onSwitch }) => {
    const [submitError, setSubmitError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate(); 

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    // Email/Password Registration
    const onSubmit = async (data) => {
        setSubmitError(null);
        setIsLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: data.name });
            const idToken = await user.getIdToken(true);

            const backendUrl = import.meta.env.VITE_APP_API_URL;
            await axios.post(
                `${backendUrl}/auth/create-or-update-user`, 
                { idToken }
            );

            setIsLoading(false);
            onClose();
            navigate('/profile');

        } catch (error) {
            setIsLoading(false);
            console.error("Registration Error:", error);
            if (error.code === 'auth/email-already-in-use') {
                setSubmitError("This email address is already in use.");
            } else if (error.code === 'auth/weak-password') {
                setSubmitError("Password should be at least 6 characters long.");
            } else {
                setSubmitError("Failed to create account. Please try again.");
            }
        }
    };

    // ⭐️ 4. Add Social Login Handler (identical to login modal)
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
                
                {/* Use the correct CSS class for the title */}
                <h2 className="modal-title">Create Account</h2>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            {...register("name")}
                        />
                        {errors.name && <p className="error-message">{errors.name.message}</p>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            {...register("email")}
                        />
                        {errors.email && <p className="error-message">{errors.email.message}</p>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            {...register("password")}
                        />
                        {errors.password && <p className="error-message">{errors.password.message}</p>}
                    </div>
                    
                    {/* Use the server-error class for better styling */}
                    {submitError && <p className="error-message server-error">{submitError}</p>}
                    
                    <button type="submit" className="btn btn-primary btn-full-width" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>

                {/* ⭐️ 5. Add Social Login section (with icons) */}
                <div className="social-login-divider">
                    <span>or</span>
                </div>
                
                <button 
                    className="btn btn-social btn-google" 
                    onClick={() => handleSocialLogin(googleProvider)}
                    disabled={isLoading}
                >
                    <FcGoogle className="social-icon" /> 
                    <span>Sign up with Google</span>
                </button>
                
                <button 
                    className="btn btn-social btn-facebook" 
                    onClick={() => handleSocialLogin(facebookProvider)}
                    disabled={isLoading}
                >
                    <FaFacebook className="social-icon" />
                    <span>Sign up with Facebook</span>
                </button>

                {/* ⭐️ 6. Add "Switch to Login" Link */}
                <div className="modal-switch">
                    Already have an account? 
                    <button className="modal-switch-link" onClick={onSwitch}>
                        Sign in
                    </button>
                </div>

            </div>
        </div>
    );
};

export default RegisterModal;