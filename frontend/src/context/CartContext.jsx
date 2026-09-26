import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setItems(res.data.data.items || []);
        setSubtotal(res.data.data.subtotal || 0);
        setItemCount(res.data.data.itemCount || 0);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async ({
    productId,
    variantId,
    size = 'M',
    color = 'Jet Black',
    quantity = 1,
    customizationId = null,
    productName = 'Product',
    price = 0,
    primaryImage = '',
    customizationData = null,
  }) => {
    try {
      setLoading(true);
      const res = await api.post('/cart', {
        productId,
        variantId,
        size,
        color,
        quantity,
        customizationId,
      });

      if (res.data.success) {
        await fetchCart();
        showToast(customizationId ? 'CUSTOM DESIGN ADDED TO CART' : 'ADDED TO CART');
        setIsCartOpen(true);
        return true;
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      // Fallback local addition if network issue
      const newItem = {
        id: 'local_' + Date.now(),
        productId,
        productName,
        size,
        color,
        quantity,
        price,
        primaryImage,
        customizationId,
        isCustomized: !!customizationId,
        customizationData,
        totalItemPrice: price * quantity,
      };
      setItems((prev) => [newItem, ...prev]);
      setSubtotal((prev) => prev + price * quantity);
      setItemCount((prev) => prev + quantity);
      showToast('ADDED TO CART');
      setIsCartOpen(true);
      return true;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/${itemId}`, { quantity });
      if (res.data.success) {
        await fetchCart();
      }
    } catch {
      // Local fallback
      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
      } else {
        setItems((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, quantity, totalItemPrice: i.price * quantity } : i))
        );
      }
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await api.delete(`/cart/${itemId}`);
      if (res.data.success) {
        await fetchCart();
        showToast('ITEM REMOVED');
      }
    } catch {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      showToast('ITEM REMOVED');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setItems([]);
      setSubtotal(0);
      setItemCount(0);
    } catch {
      setItems([]);
      setSubtotal(0);
      setItemCount(0);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        loading,
        isCartOpen,
        setIsCartOpen,
        toastMessage,
        showToast,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
