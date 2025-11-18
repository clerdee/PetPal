import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx'; 
import { Link } from 'react-router-dom';
import axios from 'axios';
import Loader from '../../layout/Loader.jsx'; 
import '../../css/adminproductlist.css'; 
import ProductModal from '../../components/admin/productmodal.jsx';
import ImageGalleryModal from '../../components/admin/imagegallerymodal.jsx';

// ⭐️ 1. Import MUI Dialog components
import { 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogContentText, 
    DialogTitle,
    Button 
} from '@mui/material';

const ProductsList = () => {
    const [products, setProducts] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalProductId, setModalProductId] = useState(null);
    const [modalMode, setModalMode] = useState(null); 
    const { idToken } = useAuth();
    const backendUrl = import.meta.env.VITE_APP_API_URL;
    const [showGallery, setShowGallery] = useState(false);
    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryProductName, setGalleryProductName] = useState('');

    // ⭐️ 2. Add state for the confirmation dialog
    const [showConfirm, setShowConfirm] = useState(false);

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/products`); 
            setProducts(data.products);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch products");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (idToken) fetchProducts();
    }, [idToken]);

    // --- Modal Handlers ---
    const openEditModal = (id) => {
        setModalProductId(id);
        setModalMode('edit');
        setShowModal(true);
    };

    const openDeleteModal = (id) => {
        setModalProductId(id);
        setModalMode('delete');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalProductId(null);
        setModalMode(null);
    };

    const openGallery = (images, name) => {
    setGalleryImages(images);
    setGalleryProductName(name);
    setShowGallery(true);
    };

    const closeGallery = () => {
        setShowGallery(false);
        setGalleryImages([]);
        setGalleryProductName('');
    };

    // --- Bulk Select Handlers ---
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = products.map(p => p._id);
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (e, id) => {
        if (e.target.checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        }
    };

    // ⭐️ 3. This function now just performs the delete
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        // ❌ Removed window.confirm
        // if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected products?`)) return;

        try {
            await axios.delete(`${backendUrl}/admin/products/delete-bulk`, {
                data: { ids: selectedIds }, 
                headers: { 'Authorization': `Bearer ${idToken}` }
            });

            setProducts(products.filter(p => !selectedIds.includes(p._id)));
            setSelectedIds([]); 
            // ❌ Removed alert
            // alert(`${selectedIds.length} products deleted successfully!`);
            // You can add a toast message here if you like

        } catch (err) {
            setError(err.response?.data?.message || "Bulk deletion failed.");
        }
    };

    // ⭐️ 4. Add a new handler for the dialog's "Confirm" button
    const handleConfirmDelete = async () => {
        setShowConfirm(false); // Close the dialog
        await handleBulkDelete(); // Call the delete function
    };

    if (loading) return <Loader />;

    return (
        <div className="admin-page-container">
            <div className="admin-page-header">
                <h1>Product List ({products.length})</h1>
                <Link to="/admin/newproduct" className="btn btn-primary">+ Add New</Link>
            </div>

            {error && <p className="error-message">{error}</p>}

            {selectedIds.length >= 2 && (
                <div className="bulk-actions-bar">
                    <span>{selectedIds.length} selected</span>
                    <button 
                        // ⭐️ 5. Change onClick to open the dialog
                        onClick={() => setShowConfirm(true)} 
                        className="btn btn-danger"
                    >
                        Bulk Delete
                    </button>
                </div>
            )}

            {selectedIds.length === 1 && (
                <div className="bulk-actions-bar">
                    <span>1 item selected</span>
                    <button 
                        onClick={() => openDeleteModal(selectedIds[0])} 
                        className="btn btn-secondary"
                    >
                        Delete
                    </button>
                </div>
            )}
            
            <div className="product-list-card">
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>
                                <input 
                                    type="checkbox" 
                                    onChange={handleSelectAll} 
                                    checked={selectedIds.length === products.length && products.length > 0} 
                                />
                            </th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id}>
                                <td>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.includes(product._id)} 
                                        onChange={(e) => handleSelectOne(e, product._id)}
                                    />
                                </td>

                                <td data-label="Image">
                                    <button 
                                        onClick={() => openGallery(product.images, product.name)}
                                        className="product-image-button" 
                                        title={`View ${product.images.length} images`}
                                    >
                                        <img 
                                            src={product.images[0]?.url} 
                                            alt={product.name} 
                                            className="product-thumb" 
                                        />
                                        {product.images.length > 1 && (
                                            <span className="image-count-badge">+{product.images.length - 1}</span>
                                        )}
                                    </button>
                                </td>
                                
                                <td data-label="Name">
                                    <button 
                                        onClick={() => openGallery(product.images, product.name)} 
                                        className="product-name-link"
                                    >
                                        {product.name}
                                    </button>
                                </td>
                                
                                <td data-label="Category">{product.category}</td>
                                <td data-label="Stock">{product.stock}</td>
                                <td data-label="Price">₱{product.price.toFixed(2)}</td>
                                
                                <td data-label="Actions">
                                    <button 
                                        onClick={() => openEditModal(product._id)} 
                                        className="btn-icon edit"
                                    >
                                        Edit
                                    </button>
                                    
                                    <button 
                                        onClick={() => openDeleteModal(product._id)}
                                        className="btn-icon delete"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && <p className="no-products">No products found. Add one!</p>}
            </div>
            
            {/* RENDER THE MODAL */}
            {showModal && (
                <ProductModal 
                    productId={modalProductId}
                    modalMode={modalMode} // Pass 'edit' or 'delete' mode
                    onClose={closeModal}
                    onUpdateSuccess={fetchProducts} 
                />
            )}
            
            {/* RENDER THE IMAGE GALLERY MODAL */}
            {showGallery && (
                <ImageGalleryModal
                    images={galleryImages}
                    productName={galleryProductName}
                    onClose={closeGallery}
                />
            )}

            {/* ⭐️ 6. Add the MUI Dialog JSX */}
            <Dialog
                open={showConfirm}
                onClose={() => setShowConfirm(false)}
                aria-labelledby="bulk-delete-confirm-title"
                aria-describedby="bulk-delete-confirm-description"
            >
                <DialogTitle id="bulk-delete-confirm-title">
                    Confirm Bulk Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="bulk-delete-confirm-description">
                        Are you sure you want to delete **{selectedIds.length}** selected products?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowConfirm(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    );
};

export default ProductsList;