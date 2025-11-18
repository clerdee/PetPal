// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, increment } from 'firebase/firestore';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const { currentUser, mongoUser } = useAuth(); 
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // ⭐️ Use currentUser.uid as fallback if mongoUser is not available
    const userId = mongoUser?.firebaseUid || currentUser?.uid; 

    // ⭐️ Firestore Cart Listener ⭐️
    useEffect(() => {
        if (!userId) {
            setCartItems([]);
            setLoading(false);
            return;
        }
        const cartRef = collection(db, `carts/${userId}/items`);
        const unsubscribe = onSnapshot(cartRef, (snapshot) => {
            const items = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    price: Number(data.price) || 0,
                    quantity: Number(data.quantity) || 1
                };
            });
            setCartItems(items);
            setLoading(false);
        }, () => setLoading(false));
        return () => unsubscribe();
    }, [userId]);

    // ⭐️ Cart Operations ⭐️

    // ⭐️ 1. THIS IS THE MISSING FUNCTION ⭐️
    const updateItemQuantity = async (itemId, newQuantity) => {
        if (!userId) return;
        try {
            const cartItemRef = doc(db, `carts/${userId}/items`, itemId);

            if (newQuantity <= 0) {
                // If quantity is 0 or less, remove the item
                await deleteDoc(cartItemRef);
            } else {
                // Otherwise, update the quantity
                await updateDoc(cartItemRef, { quantity: newQuantity });
            }
        } catch (error) {
            console.error("Error updating item quantity:", error);
        }
    };

    // ⭐️ 2. THIS IS THE UPDATED addToCart FUNCTION ⭐️
    const addToCart = async (product, quantity = 1) => {
        console.log("🛒 addToCart called with:", { productId: product._id, quantity, currentUser: !!currentUser, mongoUser: !!mongoUser, userId });
        
        if (!userId) {
            console.error("❌ No userId available. currentUser:", currentUser, "mongoUser:", mongoUser);
            return { success: false, message: "Login required to add items to cart." };
        }
        
        try {
            console.log("📝 Adding item to cart with userId:", userId);
            const cartItemRef = doc(db, `carts/${userId}/items`, product._id);

            // Ensure base fields exist
            await setDoc(cartItemRef, {
                productId: product._id,
                name: product.name,
                price: Number(product.price),
                image: product.images?.[0]?.url || '/images/pet-icon.png'
            }, { merge: true });

            // Atomically increment quantity
            await updateDoc(cartItemRef, { quantity: increment(Number(quantity)) });

            console.log("✅ Item added successfully!");
            return { success: true, message: `${product.name} added to cart!` };
        } catch (error) {
            console.error("❌ Error adding to cart:", error);
            return { success: false, message: error.message || "Failed to add item to cart. Please try again." };
        }
    };

    const removeFromCart = async (itemId) => {
        if (!userId) return;
        const cartItemRef = doc(db, `carts/${userId}/items`, itemId);
        await deleteDoc(cartItemRef);
    };
    
    const totalItems = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    const cartTotal = cartItems.reduce((acc, item) => {
        const price = Number(item.price) || 0;
        const qty = Number(item.quantity) || 0;
        return acc + (price * qty);
    }, 0);

    const value = {
        cartItems,
        totalItems,
        cartTotal,
        loading,
        addToCart,
        removeFromCart,
        updateItemQuantity 
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};