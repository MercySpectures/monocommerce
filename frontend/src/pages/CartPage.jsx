import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, Sparkles, Tag, Check, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const CartPage = () => {
  const { items, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    try {
      setCouponLoading(true);
      setCouponError('');
      const res = await api.post('/coupons/validate', {
        code: couponInput.trim(),
        cartTotal: subtotal,
      });

      if (res.data.success) {
        setAppliedCoupon(res.data.data);
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid or expired promotional code');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingFee = subtotal >= 2500 || (appliedCoupon && appliedCoupon.code === 'FREESHIP') ? 0 : 190;
  const taxAmount = Math.round((subtotal - discountAmount) * 0.05); // 5% GST
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee + taxAmount);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center space-y-6">
        <div className="w-16 h-16 border border-[#E5E5E5] mx-auto flex items-center justify-center text-[#737373]">
          <Sparkles size={24} />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-black font-editorial">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-xs text-[#737373] max-w-sm mx-auto">
          Explore our heavyweight archival silhouettes or build your own custom piece in our interactive studio.
        </p>
        <div className="pt-2 flex justify-center gap-4">
          <Link
            to="/shop"
            className="px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#262626]"
          >
            Explore Catalog
          </Link>
          <Link
            to="/customize/archival-heavyweight-tshirt"
            className="px-8 py-3.5 border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white"
          >
            Custom Studio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-[#E5E5E5]">
        <div>
          <span className="text-[11px] font-mono text-[#737373] tracking-widest uppercase block mb-1">
            CHECKOUT READY
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black font-editorial">
            Shopping Bag ({items.length})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-mono text-[#737373] hover:text-black uppercase underline"
        >
          Clear Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Items List (col 8) */}
        <div className="lg:col-span-8 divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">
          {items.map((item) => (
            <div key={item.id} className="py-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="w-20 h-24 bg-[#F5F5F5] border border-[#E5E5E5] overflow-hidden flex-shrink-0 relative">
                  <img
                    src={item.primaryImage}
                    alt={item.productName}
                    className="w-full h-full object-cover grayscale contrast-110"
                  />
                  {item.isCustomized && (
                    <span className="absolute bottom-0 inset-x-0 bg-black text-white text-[8px] font-mono text-center py-0.5 uppercase tracking-widest">
                      Studio
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#737373] uppercase">
                    SIZE: {item.size} • {item.color}
                  </span>
                  <Link
                    to={`/product/${item.productSlug}`}
                    className="text-sm font-bold uppercase text-black hover:underline block"
                  >
                    {item.productName}
                  </Link>
                  <p className="text-xs font-mono text-black font-bold">
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Quantity & Actions */}
              <div className="flex items-center gap-6 self-end sm:self-center">
                <div className="flex items-center border border-[#E5E5E5]">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 hover:bg-[#F5F5F5] text-black transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="px-3 text-xs font-mono font-medium text-black">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 hover:bg-[#F5F5F5] text-black transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <span className="text-sm font-bold font-mono text-black w-24 text-right">
                  ₹{item.totalItemPrice.toLocaleString('en-IN')}
                </span>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-[#A3A3A3] hover:text-black transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary (col 4) */}
        <div className="lg:col-span-4 bg-[#FAFAFA] border border-[#E5E5E5] p-6 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-3 border-b border-[#E5E5E5]">
            Order Summary
          </h2>

          {/* Promo code input */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="text-[10px] uppercase font-mono text-[#737373] block">
              Promotional Code
            </label>
            <div className="flex">
              <input
                type="text"
                placeholder="TRY: MONO10"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 border border-[#E5E5E5] bg-white text-xs font-mono uppercase focus:outline-none focus:border-black"
              />
              <button
                type="submit"
                disabled={couponLoading}
                className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-[#262626] transition-colors"
              >
                Apply
              </button>
            </div>
            {appliedCoupon && (
              <p className="text-[10px] font-mono text-black flex items-center gap-1 uppercase">
                <Check size={12} /> Coupon &quot;{appliedCoupon.code}&quot; applied (-₹{appliedCoupon.discountAmount})
              </p>
            )}
            {couponError && (
              <p className="text-[10px] font-mono text-[#737373] uppercase">
                ! {couponError}
              </p>
            )}
          </form>

          {/* Breakdown */}
          <div className="space-y-2 text-xs font-mono text-[#404040] pt-4 border-t border-[#E5E5E5]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-black">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-black font-semibold">
                <span>Discount ({appliedCoupon.code})</span>
                <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (5% GST)</span>
              <span>₹{taxAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Grand total */}
          <div className="pt-4 border-t border-[#E5E5E5] flex justify-between items-baseline">
            <span className="text-xs uppercase font-bold text-black tracking-wider">Total Amount</span>
            <span className="text-xl font-bold font-mono text-black">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout', { state: { coupon: appliedCoupon } })}
            className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#262626] transition-colors flex items-center justify-center gap-2 group"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <Link
            to="/shop"
            className="block text-center text-xs font-mono text-[#737373] hover:text-black uppercase underline"
          >
            Continue Browsing Catalog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
