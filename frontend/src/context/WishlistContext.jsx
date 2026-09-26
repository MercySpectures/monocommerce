import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      // Load from local storage for guests
      try {
        const local = localStorage.getItem('mono_guest_wishlist');
        setWishlist(local ? JSON.parse(local) : []);
      } catch {
        setWishlist([]);
      }
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.data.success) {
        setWishlist(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      // Local guest wishlist
      setWishlist((prev) => {
        const exists = prev.some((p) => p.id === product.id);
        let updated;
        if (exists) {
          updated = prev.filter((p) => p.id !== product.id);
        } else {
          updated = [...prev, product];
        }
        localStorage.setItem('mono_guest_wishlist', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      const res = await api.post('/wishlist/toggle', { productId: product.id });
      if (res.data.success) {
        await fetchWishlist();
      }
    } catch {
      // Fallback
      setWishlist((prev) => {
        const exists = prev.some((p) => p.id === product.id);
        return exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
      });
    }
  };

  const isWishlisted = (productId) => {
    return wishlist.some((p) => p.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        toggleWishlist,
        isWishlisted,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
