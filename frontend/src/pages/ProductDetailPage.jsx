import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart, Sparkles, ShoppingBag, ArrowRight, Check,
  ChevronDown, ChevronUp, Star, ShieldCheck, Ruler, ArrowLeft
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(null);
  const [adding, setAdding] = useState(false);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState('details');

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${slug}`);
        if (res.data.success) {
          const prod = res.data.data;
          setProduct(prod);
          setSelectedImage(prod.images?.[0]?.imageUrl || '');
          if (prod.variants?.length > 0) {
            setSelectedColor(prod.variants[0].colorName);
            setSelectedSize(prod.variants[0].size || 'M');
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-xs uppercase font-mono tracking-widest text-[#737373]">
          Loading product archival details...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-bold uppercase text-black">Product Not Found</h2>
        <Link to="/shop" className="text-xs font-mono underline uppercase">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const availableColors = Array.from(new Set(product.variants?.map((v) => v.colorName) || ['Jet Black']));
  const availableSizes = Array.from(new Set(product.variants?.map((v) => v.size) || ['S', 'M', 'L', 'XL']));

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart({
      productId: product.id,
      productName: product.name,
      price: product.discountPrice || product.base_price,
      size: selectedSize,
      color: selectedColor || 'Jet Black',
      quantity: 1,
      primaryImage: selectedImage || product.images?.[0]?.imageUrl || '',
    });
    setAdding(false);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    try {
      setReviewSubmitting(true);
      await api.post(`/products/${product.id}/reviews`, {
        rating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setReviewModalOpen(false);
      // Refresh product details
      const res = await api.get(`/products/${slug}`);
      if (res.data.success) {
        setProduct(res.data.data);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12 space-y-16">
      {/* Breadcrumb back */}
      <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#737373]">
        <Link to="/shop" className="hover:text-black flex items-center gap-1">
          <ArrowLeft size={14} /> Catalog
        </Link>
        <span>/</span>
        <span className="text-black">{product.category_name}</span>
        <span>/</span>
        <span className="text-[#A3A3A3] truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Grid: Gallery on Left + Sticky Info on Right (STREETECH / VELORA reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start">
        {/* Left: Gallery (col 7) */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Vertical thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img.imageUrl)}
                  className={`w-16 h-20 bg-[#F5F5F5] border flex-shrink-0 overflow-hidden transition-all ${
                    selectedImage === img.imageUrl ? 'border-black ring-1 ring-black' : 'border-[#E5E5E5] hover:border-[#737373]'
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.altText || product.name}
                    className="w-full h-full object-cover grayscale contrast-110"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Large Image */}
          <div className="flex-1 aspect-3/4 bg-[#F5F5F5] border border-[#E5E5E5] overflow-hidden relative">
            <img
              src={selectedImage || product.images?.[0]?.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover grayscale contrast-120 hover:scale-105 transition-transform duration-500 cursor-crosshair"
            />
            {product.is_customizable && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-black text-white text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={12} /> Studio Customization Ready
              </span>
            )}
          </div>
        </div>

        {/* Right: Sticky Product Info (col 5) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#737373] uppercase tracking-widest mb-2">
              <span>{product.category_name} // {product.sku}</span>
              {product.reviews?.length > 0 && (
                <div className="flex items-center gap-1 text-black font-semibold">
                  <Star size={12} fill="currentColor" />
                  <span>5.0 ({product.reviews.length} reviews)</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-black font-editorial">
              {product.name}
            </h1>

            {/* Price section */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-2xl font-bold font-mono text-black">
                ₹{(product.discountPrice || product.base_price).toLocaleString('en-IN')}
              </span>
              {product.discount_percent > 0 && (
                <>
                  <span className="text-sm font-mono text-[#A3A3A3] line-through">
                    ₹{parseFloat(product.base_price).toLocaleString('en-IN')}
                  </span>
                  <span className="px-2 py-0.5 bg-[#262626] text-white text-[10px] font-mono uppercase">
                    Save {Math.round(product.discount_percent)}%
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-[#737373] mt-1 font-mono">Tax included. Free shipping on orders ₹2,500+.</p>
          </div>

          {/* Description summary */}
          <p className="text-xs md:text-sm text-[#404040] leading-relaxed pt-2 border-t border-[#E5E5E5]">
            {product.description}
          </p>

          {/* CUSTOM STUDIO CTA CALLOUT (HIGH PRIORITY) */}
          {product.is_customizable && (
            <div className="p-4 bg-black text-white border border-[#262626] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} />
                <span>Bespoke Customizer Available</span>
              </div>
              <p className="text-[11px] text-[#A3A3A3] leading-normal">
                Want your own graphic or typography printed on this piece? Enter our interactive studio to position, scale, and preview your custom design.
              </p>
              <Link
                to={`/customize/${product.slug}`}
                className="w-full py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-[#E5E5E5] transition-colors flex items-center justify-center gap-2"
              >
                <span>Customize This Piece in Studio</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Color Selector */}
          <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
            <div className="flex justify-between items-center text-xs uppercase font-mono">
              <span className="text-[#737373]">Color:</span>
              <span className="font-bold text-black">{selectedColor || 'Jet Black'}</span>
            </div>
            <div className="flex items-center gap-3">
              {availableColors.map((colorName) => {
                const colorHex =
                  colorName === 'Jet Black' ? '#0A0A0A' :
                  colorName === 'Pure White' ? '#FFFFFF' :
                  colorName === 'Charcoal Gray' ? '#262626' : '#737373';

                return (
                  <button
                    key={colorName}
                    onClick={() => setSelectedColor(colorName)}
                    className={`w-8 h-8 rounded-full border transition-all ${
                      selectedColor === colorName
                        ? 'ring-2 ring-black ring-offset-2 border-black scale-105'
                        : 'border-[#D4D4D4] hover:scale-105'
                    }`}
                    style={{ backgroundColor: colorHex }}
                    title={colorName}
                  >
                    {selectedColor === colorName && (
                      <Check
                        size={14}
                        className={colorHex === '#FFFFFF' ? 'text-black mx-auto' : 'text-white mx-auto'}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
            <div className="flex justify-between items-center text-xs font-mono uppercase">
              <span className="text-[#737373]">Select Size:</span>
              <button
                onClick={() => setSizeModalOpen(true)}
                className="text-black font-semibold underline flex items-center gap-1 hover:opacity-75"
              >
                <Ruler size={12} /> Size Guide
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {availableSizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`py-3 text-xs font-mono font-bold uppercase border transition-colors ${
                    selectedSize === sz
                      ? 'bg-black text-white border-black'
                      : 'border-[#E5E5E5] text-black hover:border-black'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons: Add to Bag + Wishlist */}
          <div className="pt-4 space-y-3">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#262626] transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <ShoppingBag size={16} />
                <span>{adding ? 'Adding to Bag...' : 'Add to Bag'}</span>
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-4 border transition-colors ${
                  wishlisted ? 'border-black bg-black text-white' : 'border-[#E5E5E5] text-black hover:border-black'
                }`}
                aria-label="Wishlist piece"
              >
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
            >
              Buy It Now
            </button>
          </div>

          {/* Accordion Tabs */}
          <div className="pt-4 border-t border-[#E5E5E5] divide-y divide-[#E5E5E5]">
            {/* Details */}
            <div>
              <button
                onClick={() => setOpenAccordion(openAccordion === 'details' ? '' : 'details')}
                className="w-full py-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black"
              >
                <span>Details & Specification</span>
                {openAccordion === 'details' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordion === 'details' && (
                <div className="pb-4 text-xs text-[#404040] space-y-1.5 whitespace-pre-line leading-relaxed font-mono">
                  {product.details || '• 100% Organic Cotton\n• Pre-shrunk finish\n• Made in limited batches'}
                </div>
              )}
            </div>

            {/* Fabric & Care */}
            <div>
              <button
                onClick={() => setOpenAccordion(openAccordion === 'care' ? '' : 'care')}
                className="w-full py-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black"
              >
                <span>Fabric & Care</span>
                {openAccordion === 'care' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordion === 'care' && (
                <div className="pb-4 text-xs text-[#404040] leading-relaxed font-mono">
                  {product.fabric_care || 'Machine wash cold inside-out with like colors. Hang dry in shade.'}
                </div>
              )}
            </div>

            {/* Shipping & Returns */}
            <div>
              <button
                onClick={() => setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')}
                className="w-full py-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black"
              >
                <span>Complimentary Shipping & Returns</span>
                {openAccordion === 'shipping' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordion === 'shipping' && (
                <div className="pb-4 text-xs text-[#404040] space-y-2 leading-relaxed">
                  <p>• Complimentary domestic shipping on orders exceeding ₹2,500.</p>
                  <p>• Standard courier delivery within 2-4 business days.</p>
                  <p>• 14-day hassle-free return window on unworn standard archival items.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="pt-16 border-t border-[#E5E5E5] space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
          <div>
            <span className="text-[11px] font-mono text-[#737373] tracking-widest uppercase block mb-1">
              COMMUNITY TESTIMONIALS
            </span>
            <h2 className="text-2xl font-black uppercase tracking-tight text-black font-editorial">
              Customer Reviews ({product.reviews?.length || 0})
            </h2>
          </div>
          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-6 py-2.5 border border-black text-black text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
          >
            Write a Review
          </button>
        </div>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.reviews.map((rev) => (
              <div key={rev.id} className="p-6 border border-[#E5E5E5] space-y-3 bg-[#FAFAFA]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold uppercase text-black block">{rev.userName}</span>
                    <span className="text-[10px] font-mono text-[#737373] uppercase">
                      {rev.isVerifiedPurchase ? '✓ Verified Archival Purchase' : 'Verified Collector'}
                    </span>
                  </div>
                  <div className="flex text-black">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </div>
                </div>
                {rev.title && <h4 className="text-xs font-bold text-black uppercase">{rev.title}</h4>}
                <p className="text-xs text-[#404040] leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-xs font-mono uppercase text-[#737373]">
            No reviews yet. Be the first to share your experience with this silhouette.
          </div>
        )}
      </section>

      {/* Curated Recommendations ("You May Also Like") */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="pt-16 border-t border-[#E5E5E5] space-y-8">
          <div>
            <span className="text-[11px] font-mono text-[#737373] tracking-widest uppercase block mb-1">
              PAIR WITH
            </span>
            <h2 className="text-2xl font-black uppercase tracking-tight text-black font-editorial">
              You May Also Like
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {product.relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      {sizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 border border-black space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#E5E5E5]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-black">Measurement Matrix (Inches)</h3>
              <button onClick={() => setSizeModalOpen(false)} className="text-xs font-mono underline uppercase">
                Close
              </button>
            </div>
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="border-b border-black">
                  <th className="py-2">SIZE</th>
                  <th className="py-2">CHEST</th>
                  <th className="py-2">LENGTH</th>
                  <th className="py-2">SHOULDER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                <tr><td className="py-2 font-bold">S</td><td>42&quot;</td><td>28.5&quot;</td><td>20.5&quot;</td></tr>
                <tr><td className="py-2 font-bold">M</td><td>44&quot;</td><td>29.5&quot;</td><td>21.5&quot;</td></tr>
                <tr><td className="py-2 font-bold">L</td><td>46&quot;</td><td>30.5&quot;</td><td>22.5&quot;</td></tr>
                <tr><td className="py-2 font-bold">XL</td><td>48&quot;</td><td>31.5&quot;</td><td>23.5&quot;</td></tr>
                <tr><td className="py-2 font-bold">XXL</td><td>50&quot;</td><td>32.5&quot;</td><td>24.5&quot;</td></tr>
              </tbody>
            </table>
            <p className="text-[10px] text-[#737373] font-mono">
              All pieces cut with intentional drop-shoulder oversized streetwear fit. Take normal size for signature boxy drape.
            </p>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleReviewSubmit} className="bg-white max-w-md w-full p-6 border border-black space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#E5E5E5]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-black">Submit Archival Review</h3>
              <button type="button" onClick={() => setReviewModalOpen(false)} className="text-xs font-mono underline uppercase">
                Cancel
              </button>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setRating(num)}
                    className={`p-2 border text-xs font-mono ${rating >= num ? 'bg-black text-white border-black' : 'border-[#E5E5E5]'}`}
                  >
                    ★ {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">Review Headline</label>
              <input
                type="text"
                placeholder="e.g. Exceptional weight and drape"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E5] text-xs font-medium focus:outline-none focus:border-black uppercase"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">Feedback</label>
              <textarea
                rows={3}
                placeholder="Describe fabric structure, sizing fit, and detailing..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E5] text-xs font-medium focus:outline-none focus:border-black"
                required
              />
            </div>

            <button
              type="submit"
              disabled={reviewSubmitting}
              className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#262626]"
            >
              {reviewSubmitting ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
