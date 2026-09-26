import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, Sparkles, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, items, itemCount, subtotal, updateQuantity, removeFromCart } = useCart();
  const [selectedCustomDesign, setSelectedCustomDesign] = useState(null);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 2500;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#E5E5E5] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#E5E5E5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-wider uppercase text-black">Your Bag</h2>
              <span className="text-xs text-[#737373] font-mono">({itemCount})</span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 text-[#737373] hover:text-black transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Complimentary shipping bar */}
          <div className="px-6 py-3 bg-[#F5F5F5] border-b border-[#E5E5E5]">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider mb-1.5 font-medium">
              <span>{amountNeeded === 0 ? 'Complimentary shipping unlocked' : `Add ₹${amountNeeded.toLocaleString('en-IN')} for free shipping`}</span>
              <span className="font-mono">{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="w-full bg-[#E5E5E5] h-1 rounded-none overflow-hidden">
              <div
                className="bg-black h-full transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#E5E5E5]">
            {items.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 border border-[#E5E5E5] flex items-center justify-center mb-4 text-[#737373]">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-black">Your bag is empty</h3>
                <p className="text-xs text-[#737373] mt-1 mb-6">Discover archival pieces and customize your silhouette.</p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="px-6 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#262626] transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  <div className="w-20 h-24 bg-[#F5F5F5] border border-[#E5E5E5] flex-shrink-0 relative overflow-hidden">
                    <img
                      src={item.primaryImage}
                      alt={item.productName}
                      className="w-full h-full object-cover grayscale contrast-110"
                    />
                    {item.isCustomized && (
                      <span className="absolute bottom-0 inset-x-0 bg-black text-white text-[9px] uppercase tracking-widest text-center py-0.5 font-mono">
                        Studio Piece
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          to={`/product/${item.productSlug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-xs font-bold text-black uppercase tracking-tight hover:underline line-clamp-1"
                        >
                          {item.productName}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#A3A3A3] hover:text-black transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#737373] font-mono">
                        <span>SIZE: {item.size}</span>
                        <span>•</span>
                        <span>{item.color}</span>
                      </div>

                      {item.isCustomized && (
                        <button
                          onClick={() => setSelectedCustomDesign(item.customizationData)}
                          className="inline-flex items-center gap-1 mt-1 text-[10px] text-black underline tracking-wider font-medium uppercase hover:opacity-75"
                        >
                          <Eye size={10} /> View Custom Elements
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#E5E5E5]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-[#F5F5F5] text-black transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-xs font-mono font-medium text-black">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-[#F5F5F5] text-black transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-black">
                        ₹{item.totalItemPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout CTA */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#E5E5E5] bg-white space-y-4">
              <div className="flex items-center justify-between text-xs tracking-wider uppercase font-semibold text-black">
                <span>Subtotal</span>
                <span className="text-sm font-bold font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[11px] text-[#737373]">Taxes and shipping calculated at checkout.</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#262626] transition-colors flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/cart');
                  }}
                  className="w-full py-2.5 border border-[#E5E5E5] text-black text-xs font-semibold uppercase tracking-wider hover:bg-[#F5F5F5] transition-colors"
                >
                  View Full Bag
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for customized design inspection */}
      {selectedCustomDesign && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 border border-black space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#E5E5E5]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">Custom Studio Blueprint</h4>
              <button onClick={() => setSelectedCustomDesign(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="text-xs space-y-2 font-mono text-[#404040]">
              {selectedCustomDesign.elements?.map((el, i) => (
                <div key={i} className="p-2 bg-[#F5F5F5] border border-[#E5E5E5]">
                  <div className="font-bold text-black uppercase">{el.type}: {el.content}</div>
                  {el.fontFamily && <div>Font: {el.fontFamily} ({el.fontSize}px)</div>}
                  <div>Position: X:{Math.round(el.x || 0)} Y:{Math.round(el.y || 0)}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedCustomDesign(null)}
              className="w-full py-2 bg-black text-white text-xs uppercase tracking-wider font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDrawer;
