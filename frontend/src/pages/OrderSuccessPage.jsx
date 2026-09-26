import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, ArrowRight, Package, Truck, Clock, Sparkles } from 'lucide-react';
import api from '../services/api';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${orderId}`);
        if (res.data.success) {
          setOrder(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-xs uppercase font-mono tracking-widest text-[#737373]">
          Generating archival order confirmation...
        </div>
      </div>
    );
  }

  const shippingAddress = order?.shipping_address ? (typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address) : {};

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 space-y-12">
      {/* Header status */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-black text-white mx-auto flex items-center justify-center shadow-lg">
          <Check size={32} strokeWidth={2.5} />
        </div>
        <span className="text-[11px] font-mono tracking-widest text-[#737373] uppercase block">
          PAYMENT CAPTURED & ARCHIVED
        </span>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-black font-editorial">
          Order Confirmed
        </h1>
        <p className="text-xs md:text-sm text-[#404040] max-w-md mx-auto">
          Thank you for choosing MonoCommerce. Your order has been registered in our database and routed to our print atelier.
        </p>
      </div>

      {/* Order Meta Bar */}
      <div className="p-6 bg-[#FAFAFA] border border-[#E5E5E5] grid grid-cols-2 md:grid-cols-4 gap-6 text-xs font-mono">
        <div>
          <span className="text-[#737373] uppercase block text-[10px]">ORDER NUMBER</span>
          <span className="font-bold text-black">{order?.order_number || orderId}</span>
        </div>
        <div>
          <span className="text-[#737373] uppercase block text-[10px]">TRACKING NUMBER</span>
          <span className="font-bold text-black">{order?.tracking_number || 'PENDING'}</span>
        </div>
        <div>
          <span className="text-[#737373] uppercase block text-[10px]">TOTAL CHARGED</span>
          <span className="font-bold text-black">₹{parseFloat(order?.total_amount || 0).toLocaleString('en-IN')}</span>
        </div>
        <div>
          <span className="text-[#737373] uppercase block text-[10px]">ESTIMATED DELIVERY</span>
          <span className="font-bold text-black">2-4 BUSINESS DAYS</span>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="p-6 border border-[#E5E5E5] space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-black">
          Atelier Progress Timeline
        </h3>
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className="space-y-2">
            <div className="w-6 h-6 rounded-full bg-black text-white mx-auto flex items-center justify-center text-[10px]">✓</div>
            <p className="font-bold text-black uppercase text-[10px]">Received</p>
          </div>
          <div className="space-y-2">
            <div className="w-6 h-6 rounded-full bg-black text-white mx-auto flex items-center justify-center text-[10px]">2</div>
            <p className="font-bold text-black uppercase text-[10px]">Processing</p>
          </div>
          <div className="space-y-2">
            <div className="w-6 h-6 rounded-full bg-[#E5E5E5] text-[#737373] mx-auto flex items-center justify-center text-[10px]">3</div>
            <p className="text-[#737373] uppercase text-[10px]">Studio Print</p>
          </div>
          <div className="space-y-2">
            <div className="w-6 h-6 rounded-full bg-[#E5E5E5] text-[#737373] mx-auto flex items-center justify-center text-[10px]">4</div>
            <p className="text-[#737373] uppercase text-[10px]">Dispatched</p>
          </div>
        </div>
      </div>

      {/* Items Manifest */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-black pb-2 border-b border-[#E5E5E5]">
          Ordered Silhouettes
        </h3>
        <div className="divide-y divide-[#E5E5E5] border border-[#E5E5E5]">
          {order?.items?.map((item) => (
            <div key={item.id} className="p-4 flex gap-4 items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-20 bg-[#F5F5F5] border border-[#E5E5E5] overflow-hidden flex-shrink-0 relative">
                  <img src={item.image} alt="" className="w-full h-full object-cover grayscale" />
                  {item.customization_id && (
                    <span className="absolute bottom-0 inset-x-0 bg-black text-white text-[7px] text-center font-mono uppercase">
                      Studio
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-black uppercase">{item.product_name}</h4>
                  <p className="text-[10px] font-mono text-[#737373]">
                    SIZE: {item.size} • COLOR: {item.color} • QTY: {item.quantity}
                  </p>
                  {item.custom_design_data && (
                    <p className="text-[10px] font-mono text-black font-semibold mt-1">
                      [CUSTOM TEXT / GRAPHIC PROCESSED]
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-black">
                ₹{parseFloat(item.total_price).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Address Review */}
      <div className="p-6 bg-[#FAFAFA] border border-[#E5E5E5] space-y-2 text-xs font-mono">
        <h4 className="font-bold text-black uppercase">Shipping Destination</h4>
        <p className="text-[#404040]">{shippingAddress.name || order?.customer_name}</p>
        <p className="text-[#737373]">{shippingAddress.addressLine1}</p>
        {shippingAddress.addressLine2 && <p className="text-[#737373]">{shippingAddress.addressLine2}</p>}
        <p className="text-[#737373]">{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
        <p className="text-[#737373]">{shippingAddress.country || 'India'}</p>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <Link
          to="/shop"
          className="px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#262626] transition-colors"
        >
          Return to Catalog
        </Link>
        <Link
          to="/account"
          className="px-8 py-3.5 border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
        >
          View My Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
