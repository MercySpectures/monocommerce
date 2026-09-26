import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/product/ProductCard';

const WishlistPage = () => {
  const { wishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-4">
        <div className="w-16 h-16 border border-[#E5E5E5] mx-auto flex items-center justify-center text-[#737373]">
          <Heart size={24} />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-black font-editorial">
          Saved For Later
        </h1>
        <p className="text-xs text-[#737373]">
          You have no archived items in your wishlist. Save silhouettes while exploring the catalog.
        </p>
        <Link
          to="/shop"
          className="inline-block px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#262626] transition-colors"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-16 space-y-8">
      <div className="pb-6 border-b border-[#E5E5E5]">
        <span className="text-[10px] font-mono text-[#737373] tracking-widest uppercase block mb-1">
          PERSONAL ROTATION
        </span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-black font-editorial">
          Saved Wishlist ({wishlist.length})
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {wishlist.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
