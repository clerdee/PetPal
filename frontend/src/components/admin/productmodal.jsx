// src/components/admin/productmodal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import axios from 'axios';
import Loader from '../../layout/Loader.jsx';
import '../../css/adminproduct.css'; 

// We assume this modal handles both EDIT and DELETE confirmation
const ProductModal = ({ productId, onClose, onUpdateSuccess, modalMode }) => {
    const { idToken } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);

    const backendUrl = import.meta.env.VITE_APP_API_URL;
    const isEditMode = !!productId; // True if an ID is passed

    // --- State for the Form ---
    const [formData, setFormData] = useState({
        name: '', price: 0, description: '', category: '', stock: 0, 
    });
    const [images, setImages] = useState([]); // Base64 or existing Cloudinary URLs
    const [imagesPreview, setImagesPreview] = useState([]);

    const categories = [
        'Clothes','Food', 'Grooming', 'Toys', 'Service'
    ];

    // --- 1. Fetch Product Data for Edit Mode ---
    useEffect(() => {
        if (!isEditMode) {
            setLoading(false);
            return;
        }

        const fetchProduct = async () => {
            try {
                // Hitting the public GET single product route
                const { data } = await axios.get(`${backendUrl}/product/${productId}`);
                
                setProduct(data.product);
                
                // Initialize form state
                setFormData({
                    name: data.product.name,
                    price: data.product.price,
                    description: data.product.description,
                    category: data.product.category,
                    stock: data.product.stock,
                });
                
                // Set images to existing URLs for display
                setImagesPreview(data.product.images.map(img => img.url));
                // Set initial images state to existing Cloudinary data (public_id and url)
                setImages(data.product.images); 

                setLoading(false);
            } catch (err) {
                setError("Failed to fetch product details.");
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId, backendUrl, isEditMode]);

    // --- 2. Handle Image/Base64 Change ---
    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        // Clear old images if new ones are selected for simplicity in update logic
        setImages([]);
        setImagesPreview([]);
        
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagesPreview((oldArray) => [...oldArray, reader.result]);
                    // Only store the Base64 string for new uploads
                    setImages((oldArray) => [...oldArray, reader.result]); 
                }
            };
            reader.readAsDataURL(file);
        });
    };

    // --- 3. Handle Submit (Edit Logic) ---
    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        const dataToSend = { ...formData };
        
        if (images.every(img => typeof img === 'string')) { 
            dataToSend.images = images; 
        } else {
        }

        try {
            await axios.put(
                `${backendUrl}/admin/product/${productId}`,
                dataToSend,
                { headers: { 'Authorization': `Bearer ${idToken}` } }
            );

            // Notify parent component to refresh the list
            onUpdateSuccess(); 
            onClose();

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update product.');
        } finally {
            setLoading(false);
        }
    };
    
    // --- 4. Handle Delete Confirmation ---
    const handleDelete = async () => {
        if (!window.confirm(`CONFIRM: Delete product ${formData.name}?`)) return;

        setIsDeleting(true);
        try {
            // Call the DELETE endpoint (DELETE /api/v1/admin/product/:id)
            await axios.delete(`${backendUrl}/admin/product/${productId}`, {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });

            // Notify parent component to refresh the list
            onUpdateSuccess(); 
            onClose();

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete product.');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return <div className="modal-backdrop"><Loader /></div>;
    if (error) return <div className="modal-backdrop">Error: {error}</div>;

    // --- Main Modal Render ---
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                
                <h2>{isEditMode ? 'Edit Product' : 'Confirm Delete'}</h2>
                
                {/* --- Delete Confirmation View --- */}
                    {modalMode === 'delete' ? (
                        <div className="delete-confirm-box">
                            <p>Are you absolutely sure you want to delete the product: <strong>{product?.name}</strong>?</p>
                            <p>This action is irreversible and will delete associated images from Cloudinary.</p>
                            <div className="modal-actions-footer">
                                <button 
                                    onClick={handleDelete} 
                                    className="btn btn-danger" 
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'YES, Delete Permanently'}
                                </button>
                                <button onClick={onClose} className="btn btn-secondary" disabled={isDeleting}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                    // --- Edit Form View ---
                    <form onSubmit={submitHandler} className="new-product-form">
    
    {/* --- ROW 1: Name (Full Width) --- */}
    <div className="form-group full-span">
        <label>Name</label>
        <input 
            type="text" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            required 
        />
    </div>

    {/* --- ROW 2: Price and Stock (Half Width) --- */}
    <div className="form-group half-width">
        <label>Price (₱)</label>
        <input 
            type="number" 
            value={formData.price} 
            onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} 
            required 
        />
    </div>
    
    <div className="form-group half-width">
        <label>Stock</label>
        <input 
            type="number" 
            value={formData.stock} 
            onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} 
            required 
        />
    </div>

    {/* --- ROW 3: Category (Full Width) --- */}
    <div className="form-group full-span">
        <label>Category</label>
        <select 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})} 
            required
        >
            <option value="">Select Category</option>
            {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
            ))}
        </select>
    </div>
    
    {/* --- ROW 4: Description (Full Width) --- */}
    <div className="form-group full-span">
        <label>Description</label>
        <textarea 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            rows="3" 
            required
        />
    </div>
    
    {/* --- ROW 5: Image Upload (Full Width) --- */}
    <div className="form-group image-upload-group full-span">
        <label>Product Images (New upload will REPLACE ALL)</label>
        <input type="file" name="images" accept="image/*" multiple onChange={handleImagesChange} />
        
        <div className="image-preview-container">
            {imagesPreview.map((image, index) => (
                <img key={index} src={image} alt={`Preview ${index + 1}`} className="image-preview-thumb" />
            ))}
        </div>
    </div>      

    {/* --- ACTION FOOTER (Full Width) --- */}
    <div className="modal-actions-footer full-span">
        <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
            Cancel
        </button>
    </div>
</form>
                )}
            </div>
        </div>
    );
};

export default ProductModal;