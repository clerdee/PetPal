// src/pages/admin/newproduct.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from '../../layout/Loader.jsx';
import '../../css/adminproduct.css';

// 1. Define Schema
const schema = yup.object().shape({
    name: yup.string().required("Product Name is required"),
    price: yup.number().typeError("Price must be a number").positive("Price must be greater than 0").required("Price is required"),
    stock: yup.number().typeError("Stock must be a number").integer("Stock must be an integer").min(0, "Stock cannot be negative").required("Stock is required"),
    category: yup.string().required("Please select a category"),
    description: yup.string().required("Description is required"),
});

const NewProduct = () => {
    const { idToken } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Image State (Managed manually)
    const [images, setImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([]);

    const categories = ['Clothes', 'Food', 'Grooming', 'Toys', 'Accessories'];

    // 2. Initialize RHF
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });
    
    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 4) {
            setError("You can only upload a maximum of 4 images.");
            return;
        }
        setImages([]);
        setImagesPreview([]);
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagesPreview((old) => [...old, reader.result]);
                    setImages((old) => [...old, reader.result]);
                }
            };
            reader.readAsDataURL(file);
        });
        setError(null);
    };

    // 3. Submit Handler
    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (images.length === 0) {
            setError("Please upload at least one product image.");
            setLoading(false);
            return;
        }

        const productData = {
            ...data, 
            images
        };

        try {
            const backendUrl = import.meta.env.VITE_APP_API_URL;
            await axios.post(
                `${backendUrl}/admin/product/new`,
                productData,
                {
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setSuccess('Product created successfully!');
            setLoading(false);
            navigate('/admin/products'); 

        } catch (err) {
            console.error("New Product Error:", err);
            setError(err.response?.data?.message || 'Failed to create product.');
            setLoading(false);
        }
    };

    return (
        <div className="admin-page-container">
            <h1>Create New Product/Service</h1>
            
            <form onSubmit={handleSubmit(onSubmit)} className="new-product-form">
                
                <div className="form-group full-span">
                    <label>Name</label>
                    <input type="text" {...register("name")} />
                    {errors.name && <p className="error-message">{errors.name.message}</p>}
                </div>
                
                <div className="form-group half-width">
                    <label>Price (₱)</label>
                    <input type="number" {...register("price")} />
                    {errors.price && <p className="error-message">{errors.price.message}</p>}
                </div>
                
                <div className="form-group half-width">
                    <label>Stock</label>
                    <input type="number" {...register("stock")} />
                    {errors.stock && <p className="error-message">{errors.stock.message}</p>}
                </div>

                <div className="form-group full-span">
                    <label>Category</label>
                    <select {...register("category")}>
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    {errors.category && <p className="error-message">{errors.category.message}</p>}
                </div>

                <div className="form-group full-span">
                    <label>Description</label>
                    <textarea {...register("description")} rows="4"></textarea>
                    {errors.description && <p className="error-message">{errors.description.message}</p>}
                </div>
                
                <div className="form-group image-upload-group full-span">
                    <label>Product Images (Max 4)</label>
                    <input type="file" name="images" accept="image/*" multiple onChange={handleImagesChange} />
                    
                    <div className="image-preview-container">
                        {imagesPreview.map((image, index) => (
                            <img key={index} src={image} alt={`Preview ${index + 1}`} className="image-preview-thumb" />
                        ))}
                    </div>
                </div>

                <div className="modal-actions-footer full-span">
                    {error && <p className="error-message" style={{width: '100%', textAlign: 'right'}}>{error}</p>}
                    {success && <p className="success-message" style={{width: '100%', textAlign: 'right'}}>{success}</p>}
                    
                    <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? <Loader size="small" /> : 'Create Product'}
                    </button>
                    <button type="button" onClick={() => navigate('/admin/products')} disabled={loading} className="btn btn-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewProduct;