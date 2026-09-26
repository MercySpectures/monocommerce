import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000';
  const secondaryImage = product.images?.[1]?.imageUrl || primaryImage;
  const wishlisted = isWishlisted(product.id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.is_customizable) {
      navigate(`/customize/${product.slug}`);
      return;
    }

    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.discountPrice || product.base_price,
      size: product.sizes?.[0] || 'M',
      color: product.colors?.[0]?.colorName || 'Jet Black',
      quantity: 1,
      primaryImage,
    });
  };

  return (
    <div
      className="group relative flex flex-col border border-[#E5E5E5] bg-white transition-all duration-300 hover:border-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link to={`/product/${product.slug}`} className="relative aspect-3/4 w-full bg-[#F5F5F5] overflow-hidden block">
        <img
          src={isHovered ? secondaryImage : primaryImage}
          alt={product.name}
          className="w-full h-full object-cover grayscale contrast-115 group-hover:scale-103 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_customizable && (
            <span className="px-2 py-0.5 bg-black text-white text-[9px] uppercase tracking-widest font-mono font-bold flex items-center gap-1">
              <Sparkles size={10} /> Studio Ready
            </span>
          )}
          {product.is_new_arrival && (
            <span className="px-2 py-0.5 bg-white text-black text-[9px] uppercase tracking-widest font-mono font-bold border border-black">
              New Arrival
            </span>
          )}
          {product.discount_percent > 0 && (
            <span className="px-2 py-0.5 bg-[#262626] text-white text-[9px] uppercase tracking-widest font-mono">
              -{Math.round(product.discount_percent)}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-xs border transition-colors z-10 ${
            wishlisted ? 'border-black text-black bg-white' : 'border-[#E5E5E5] text-[#737373] hover:text-black hover:border-black'
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>

        {/* Quick Add Overlay Bar */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleQuickAdd}
            className="w-full py-2.5 bg-white text-black text-[11px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors duration-200 flex items-center justify-center gap-1.5"
          >
            {product.is_customizable ? (
              <>
                <Sparkles size={12} />
                <span>Customize Piece</span>
              </>
            ) : (
              <>
                <span>Quick Add</span>
                <ArrowRight size={12} />
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white border-t border-[#E5E5E5]">
        <div>
          <div className="flex items-center justify-between text-[10px] uppercase font-mono text-[#737373] tracking-widest mb-1.5">
            <span>{product.category_name || 'Apparel'}</span>
            {product.averageRating && (
              <span className="text-black font-semibold">★ {product.averageRating}</span>
            )}
          </div>

          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-tight text-black line-clamp-1 group-hover:underline">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-3 pt-3 border-t border-[#F5F5F5] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xs md:text-sm font-bold font-mono text-black">
              ₹{(product.discountPrice || product.base_price).toLocaleString('en-IN')}
            </span>
            {product.discount_percent > 0 && (
              <span className="text-[11px] font-mono text-[#A3A3A3] line-through">
                ₹{parseFloat(product.base_price).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Grayscale Color Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1">
              {product.colors.slice(0, 4).map((c, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full border border-[#D4D4D4]"
                  style={{ backgroundColor: c.colorHex }}
                  title={c.colorName}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
