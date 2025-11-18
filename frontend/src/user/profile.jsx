// src/User/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import Loader from '../layout/Loader.jsx';
import '../css/profile.css'; 

// 1. Define Schema
const schema = yup.object().shape({
    name: yup.string().required("Display Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    fullName: yup.string().required("Recipient Name is required for shipping"),
    phoneNumber: yup.string().required("Phone Number is required").matches(/^[0-9]+$/, "Must be only digits"),
    city: yup.string().required("City is required"),
    shippingAddress: yup.string().required("Shipping Address is required"),
    country: yup.string() // Optional/Locked
});

const Profile = () => {
    const { idToken } = useAuth(); 
    const [loading, setLoading] = useState(true);
    const [submitError, setSubmitError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Separate state for Avatar (RHF handles text/selects better)
    const [avatarPreview, setAvatarPreview] = useState(''); 
    const [avatar, setAvatar] = useState(null); 

    const backendUrl = import.meta.env.VITE_APP_API_URL;

    // 2. Initialize Hook Form
    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(schema),
    });

    // 3. Fetch & Populate Data
    useEffect(() => {
        const fetchProfile = async () => {
            if (!idToken) {
                setLoading(false);
                return;
            }
            try {
                const { data } = await axios.get(`${backendUrl}/me`, {
                    headers: { 'Authorization': `Bearer ${idToken}` }
                });
                
                // Set Avatar State
                setAvatarPreview(data.user.avatar.url);
                
                // Populate Form Fields using RESET
                reset({
                    name: data.user.name,
                    email: data.user.email,
                    fullName: data.user.fullName || data.user.name || '',
                    phoneNumber: data.user.phoneNumber || '',
                    city: data.user.city || 'Metro Manila',
                    shippingAddress: data.user.shippingAddress || '',
                    country: data.user.country || 'Philippines'
                });

                setLoading(false);

            } catch (err) {
                console.error("Fetch Profile Error:", err);
                setSubmitError('Failed to load profile.');
                setLoading(false);
            }
        };

        fetchProfile();
    }, [idToken, backendUrl, reset]); 

    // 4. Handle Avatar File
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result); 
                setAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // 5. Handle Submit (Data comes from RHF)
    const onSubmit = async (data) => {
        setSuccess(null);
        setSubmitError(null);

        const updateData = {
            ...data, // Spread all form fields (name, email, address, etc.)
            ...(avatar && { avatar: avatar }) // Add avatar if changed
        };

        try {
            const res = await axios.put(`${backendUrl}/me/update`, updateData, {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });

            setSuccess('Profile updated successfully!');
            // Update local avatar preview if server returned a new URL
            if (res.data.user.avatar?.url) {
                setAvatarPreview(res.data.user.avatar.url);
            }
            setAvatar(null);

        } catch (err) {
            console.error("Update Error:", err);
            if (err.response && err.response.status === 409) {
                setSubmitError(err.response.data.message);
            } else {
                setSubmitError('Failed to update profile.');
            }
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="profile-page-container">
            <div className="profile-content-box">
                <h1>My Profile</h1>
                <p>Update your personal, contact, and shipping defaults here.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
                    
                    <div className="form-group avatar-group">
                        <label>Profile Picture</label>
                        <div className="avatar-preview-wrapper">
                            <img src={avatarPreview || 'default-avatar.png'} alt="Avatar" className="avatar-preview-img" />
                        </div>
                        <input type="file" id="avatar-upload" accept="image/*" onChange={handleFileChange} className="avatar-file-input" />
                        <label htmlFor="avatar-upload" className="btn btn-secondary">Choose New Image</label>
                    </div>

                    {/* --- ACCOUNT INFO --- */}
                    <h2 className="form-section-title">Account Details</h2>
                    <div className="form-group-row">
                        <div className="form-group half-width">
                            <label>Display Name</label>
                            <input type="text" className="profile-input" {...register("name")} />
                            {errors.name && <p className="error-message">{errors.name.message}</p>}
                        </div>
                        <div className="form-group half-width">
                            <label>Email Address</label>
                            <input type="email" className="profile-input" {...register("email")} />
                            {errors.email && <p className="error-message">{errors.email.message}</p>}
                        </div>
                    </div>
                    
                    {/* --- SHIPPING INFO --- */}
                    <h2 className="form-section-title">Default Shipping Info</h2>
                    <div className="form-group">
                        <label>Recipient Full Name</label>
                        <input type="text" className="profile-input" {...register("fullName")} placeholder="Full name for delivery" />
                        {errors.fullName && <p className="error-message">{errors.fullName.message}</p>}
                    </div>
                    
                    <div className="form-group-row">
                        <div className="form-group half-width">
                            <label>Phone Number</label>
                            <input type="text" className="profile-input" {...register("phoneNumber")} placeholder="e.g., 0917xxxxxxx" />
                            {errors.phoneNumber && <p className="error-message">{errors.phoneNumber.message}</p>}
                        </div>
                        <div className="form-group half-width">
                            <label>City/Municipality</label>
                            <input type="text" className="profile-input" {...register("city")} placeholder="e.g., Metro Manila" />
                            {errors.city && <p className="error-message">{errors.city.message}</p>}
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Country</label>
                        <input type="text" className="profile-input" {...register("country")} disabled />
                    </div>

                    <div className="form-group">
                        <label>Full Shipping Address (Unit/Street)</label>
                        <textarea className="profile-input" {...register("shippingAddress")} rows="2" placeholder="House/Unit No., Street Name, Barangay" />
                        {errors.shippingAddress && <p className="error-message">{errors.shippingAddress.message}</p>}
                    </div>

                    {submitError && <p className="error-message">{submitError}</p>}
                    {success && <p className="success-message">{success}</p>}

                    <button type="submit" className="btn btn-primary btn-full-width" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Save Profile Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;