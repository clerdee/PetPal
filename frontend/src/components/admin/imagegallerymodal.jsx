// src/components/admin/imagegallerymodal.jsx
import React, { useState } from 'react';
import '../../css/modal.css'; 

const ImageGalleryModal = ({ images, productName, onClose }) => {
    // State to track the currently displayed image index
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Check if we have valid images
    if (!images || images.length === 0) {
        return (
            <div className="modal-backdrop" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                    <h2>Gallery: {productName}</h2>
                    <p>No images available for this product.</p>
                </div>
            </div>
        );
    }

    const nextImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    };

    const prevImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content image-gallery-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                
                <h2>Gallery: {productName}</h2>
                
                <div className="gallery-container">
                    {/* Previous Button */}
                    <button onClick={prevImage} className="gallery-nav-btn prev-btn">
                        &#10094; {/* Left Arrow */}
                    </button>

                    {/* Main Image */}
                    <img 
                        src={images[currentIndex].url} 
                        alt={`${productName} ${currentIndex + 1}`} 
                        className="gallery-main-image"
                    />

                    {/* Next Button */}
                    <button onClick={nextImage} className="gallery-nav-btn next-btn">
                        &#10095; {/* Right Arrow */}
                    </button>
                </div>

                <div className="gallery-footer">
                    Image {currentIndex + 1} of {images.length}
                </div>
            </div>
        </div>
    );
};

export default ImageGalleryModal;