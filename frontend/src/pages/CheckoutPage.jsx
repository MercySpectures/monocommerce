import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, CheckCircle, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const appliedCoupon = location.state?.coupon || null;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const [shippingMethod, setShippingMethod] = useState('standard');
  const shippingFee = shippingMethod === 'express' ? 190 : (subtotal >= 2500 || appliedCoupon?.code === 'FREESHIP' ? 0 : 150);
  const taxAmount = Math.round((subtotal - discountAmount) * 0.05);
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee + taxAmount);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    country: 'India',
  });
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentAndOrder = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.addressLine1 || !formData.city || !formData.postalCode) {
      setErrorMessage('Please fill in all required shipping address fields');
      return;
    }

    try {
      setProcessing(true);
      setErrorMessage('');

      // 1. Create Razorpay order on backend
      const rzpRes = await api.post('/orders/razorpay-order', {
        amount: grandTotal,
        currency: 'INR',
      });

      const { orderId: razorpayOrderId, keyId } = rzpRes.data.data;

      // 2. Prepare items payload
      const orderItemsPayload = items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        variantId: item.variantId,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        customizationId: item.customizationId,
        customizationData: item.customizationData,
      }));

      // 3. Razorpay integration or verified checkout
      const finalizeOrder = async (rzpPaymentId, rzpSignature) => {
        const verifyRes = await api.post('/orders/verify', {
          razorpayOrderId,
          razorpayPaymentId: rzpPaymentId,
          razorpaySignature: rzpSignature,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          shippingAddress: formData,
          subtotal,
          shippingCost: shippingFee,
          discountAmount,
          taxAmount,
          totalAmount: grandTotal,
          couponCode: appliedCoupon?.code || null,
          items: orderItemsPayload,
        });

        if (verifyRes.data.success) {
          await clearCart();
          navigate(`/order-success/${verifyRes.data.data.orderId}`, {
            state: { order: verifyRes.data.data },
          });
        }
      };

      // Check if window.Razorpay is available and real live keys
      if (window.Razorpay && !keyId.includes('monoCommerce')) {
        const options = {
          key: keyId,
          amount: grandTotal * 100,
          currency: 'INR',
          name: 'MONOCOMMERCE®',
          description: 'Archival Monochrome Pieces & Custom Studio',
          order_id: razorpayOrderId,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#000000',
          },
          handler: async (response) => {
            await finalizeOrder(response.razorpay_payment_id, response.razorpay_signature);
          },
          modal: {
            ondismiss: () => {
              setProcessing(false);
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Direct sandbox verified checkout
        setTimeout(async () => {
          await finalizeOrder(`pay_mock_${Date.now()}`, 'verified_mock_signature');
        }, 1200);
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      setErrorMessage(err.response?.data?.message || 'Checkout could not be completed. Please try again.');
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold uppercase text-black">Your bag is empty</h2>
        <Link to="/shop" className="text-xs font-mono underline uppercase">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12 space-y-8">
      {/* Top back */}
      <div className="flex items-center justify-between pb-6 border-b border-[#E5E5E5]">
        <Link to="/cart" className="flex items-center gap-2 text-xs font-mono uppercase text-[#737373] hover:text-black">
          <ArrowLeft size={14} /> Back to Bag
        </Link>
        <span className="text-xs font-mono uppercase tracking-widest text-[#737373] flex items-center gap-1.5">
          <Lock size={12} /> 256-BIT ENCRYPTED CHECKOUT
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Form (col 7) */}
        <form onSubmit={handlePaymentAndOrder} className="lg:col-span-7 space-y-8">
          {/* Contact Details */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black pb-2 border-b border-[#E5E5E5]">
              01 // Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Devin Vance"
                  required
                  className="w-full px-3 py-2.5 border border-[#E5E5E5] text-xs font-medium uppercase focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">
                  Email Address (For Order Receipts) *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="devin@example.com"
                  required
                  className="w-full px-3 py-2.5 border border-[#E5E5E5] text-xs font-medium focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">
                  Phone Number (For Courier Updates)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2.5 border border-[#E5E5E5] text-xs font-medium focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black pb-2 border-b border-[#E5E5E5]">
              02 // Delivery Destination
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">
                  Street Address & Apartment *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Apt 4B, Indiranagar 100ft Road"
                  required
                  className="w-full px-3 py-2.5 border border-[#E5E5E5] text-xs font-medium uppercase focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-[#E5E5E5] text-xs font-medium uppercase focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-[#E5E5E5] text-xs font-medium uppercase focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-[#E5E5E5] text-xs font-mono font-medium focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Method */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black pb-2 border-b border-[#E5E5E5]">
              03 // Courier Speed
            </h2>
            <div className="space-y-2">
              <label
                className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${
                  shippingMethod === 'standard' ? 'border-black bg-[#FAFAFA]' : 'border-[#E5E5E5]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className="accent-black"
                  />
                  <div>
                    <span className="text-xs font-bold uppercase text-black block">Standard Domestic Courier</span>
                    <span className="text-[11px] text-[#737373]">Delivery within 2-4 business days</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-black">
                  {subtotal >= 2500 || appliedCoupon?.code === 'FREESHIP' ? 'FREE' : '₹150'}
                </span>
              </label>

              <label
                className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${
                  shippingMethod === 'express' ? 'border-black bg-[#FAFAFA]' : 'border-[#E5E5E5]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                    className="accent-black"
                  />
                  <div>
                    <span className="text-xs font-bold uppercase text-black block">Air Express Dispatch</span>
                    <span className="text-[11px] text-[#737373]">Priority next-day processing & tracking</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-black">₹190</span>
              </label>
            </div>
          </div>

          {/* Payment Gateway: Razorpay */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black pb-2 border-b border-[#E5E5E5]">
              04 // Payment Gateway
            </h2>
            <div className="p-4 border border-black bg-[#FAFAFA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-black" />
                <div>
                  <span className="text-xs font-bold uppercase text-black block">Razorpay Secure Checkout</span>
                  <span className="text-[11px] text-[#737373]">UPI, Cards, Netbanking & Wallets</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#737373] uppercase">SANDBOX ENABLED</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-[#171717] text-white text-xs font-mono">
              ! {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={processing}
            className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#262626] transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <ShieldCheck size={16} />
            <span>
              {processing ? 'Processing Payment & Creating Order...' : `Pay ₹${grandTotal.toLocaleString('en-IN')} & Complete Order`}
            </span>
          </button>
        </form>

        {/* Right Summary (col 5) */}
        <div className="lg:col-span-5 bg-[#FAFAFA] border border-[#E5E5E5] p-6 space-y-6 lg:sticky lg:top-24">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-3 border-b border-[#E5E5E5]">
            Bag Manifest ({items.length} items)
          </h2>

          <div className="divide-y divide-[#E5E5E5] max-h-72 overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.id} className="py-3 flex gap-3 items-center">
                <div className="w-12 h-14 bg-[#F5F5F5] border border-[#E5E5E5] overflow-hidden flex-shrink-0 relative">
                  <img src={item.primaryImage} alt="" className="w-full h-full object-cover grayscale" />
                  {item.isCustomized && (
                    <span className="absolute bottom-0 inset-x-0 bg-black text-white text-[7px] text-center font-mono uppercase">
                      Custom
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-bold text-black uppercase truncate">{item.productName}</p>
                  <p className="text-[10px] font-mono text-[#737373]">
                    {item.size} • {item.color} • Qty {item.quantity}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-black">
                  ₹{item.totalItemPrice.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs font-mono text-[#404040] pt-4 border-t border-[#E5E5E5]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-black">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-black font-semibold">
                <span>Coupon ({appliedCoupon.code})</span>
                <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping ({shippingMethod})</span>
              <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (5% GST)</span>
              <span>₹{taxAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E5E5] flex justify-between items-baseline">
            <span className="text-xs uppercase font-bold text-black tracking-wider">Total</span>
            <span className="text-2xl font-black font-mono text-black">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
