// src/pages/admin/productslist.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx'; 
import { Link } from 'react-router-dom';
import axios from 'axios';
import Loader from '../../layout/Loader.jsx'; 
import '../../css/adminproductlist.css'; 
import ProductModal from '../../components/admin/productmodal.jsx';
import ImageGalleryModal from '../../components/admin/imagegallerymodal.jsx';

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

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected products?`)) return;

        try {
            await axios.delete(`${backendUrl}/admin/products/delete-bulk`, {
                data: { ids: selectedIds }, 
                headers: { 'Authorization': `Bearer ${idToken}` }
            });

            setProducts(products.filter(p => !selectedIds.includes(p._id)));
            setSelectedIds([]); 
            alert(`${selectedIds.length} products deleted successfully!`);

        } catch (err) {
            setError(err.response?.data?.message || "Bulk deletion failed.");
        }
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
                        onClick={handleBulkDelete} 
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
                                
                                {/* ⭐️ NAME CELL: MODIFIED TO BE CLICKABLE (Image Gallery) ⭐️ */}
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
                                
                                {/* ⭐️ ACTIONS CELL ⭐️ */}
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
            
            {/* ⭐️ RENDER THE MODAL ⭐️ */}
            {showModal && (
                <ProductModal 
                    productId={modalProductId}
                    modalMode={modalMode} // Pass 'edit' or 'delete' mode
                    onClose={closeModal}
                    // This prop refreshes the list when the modal is closed after a successful action
                    onUpdateSuccess={fetchProducts} 
                />
            )}
            
            {/* ⭐️ RENDER THE IMAGE GALLERY MODAL ⭐️ */}
            {showGallery && (
                <ImageGalleryModal
                    images={galleryImages}
                    productName={galleryProductName}
                    onClose={closeGallery}
                />
            )}
        </div>
    );
};

export default ProductsList;