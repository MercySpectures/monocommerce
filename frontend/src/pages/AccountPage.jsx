import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, MapPin, User, LogOut, Heart, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AccountPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile' | 'addresses'
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: '/account' } });
      return;
    }

    const fetchAccountData = async () => {
      try {
        setLoading(true);
        const [ordersRes, profileRes] = await Promise.all([
          api.get('/orders/my-orders'),
          api.get('/auth/profile'),
        ]);

        if (ordersRes.data.success) {
          setOrders(ordersRes.data.data);
        }
        if (profileRes.data.success) {
          setAddresses(profileRes.data.data.addresses || []);
        }
      } catch (err) {
        console.error('Account data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-16 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#E5E5E5] gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#737373] tracking-widest uppercase block mb-1">
            CLIENT ARCHIVE
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black font-editorial">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs font-mono text-[#737373] mt-1">{user?.email}</p>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 border border-[#E5E5E5] text-xs font-mono uppercase text-[#737373] hover:text-black hover:border-black transition-colors"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E5E5] gap-8">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
            activeTab === 'orders' ? 'border-b-2 border-black text-black' : 'text-[#737373] hover:text-black'
          }`}
        >
          <Package size={14} />
          <span>Order History ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
            activeTab === 'addresses' ? 'border-b-2 border-black text-black' : 'text-[#737373] hover:text-black'
          }`}
        >
          <MapPin size={14} />
          <span>Saved Addresses ({addresses.length})</span>
        </button>

        <Link
          to="/wishlist"
          className="pb-3 text-xs font-bold uppercase tracking-wider text-[#737373] hover:text-black transition-colors flex items-center gap-2"
        >
          <Heart size={14} />
          <span>Saved Wishlist</span>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono uppercase tracking-widest text-[#737373]">
          Loading client archival records...
        </div>
      ) : activeTab === 'orders' ? (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="py-16 text-center border border-[#E5E5E5] p-8 space-y-4">
              <p className="text-xs uppercase font-bold text-black">No order history recorded</p>
              <p className="text-xs text-[#737373]">Your archival order manifests will appear here once placed.</p>
              <Link
                to="/shop"
                className="inline-block px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#262626]"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((ord) => (
                <div key={ord.id} className="border border-[#E5E5E5] bg-white divide-y divide-[#E5E5E5]">
                  {/* Order Top Bar */}
                  <div className="p-4 sm:p-6 bg-[#FAFAFA] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <span className="text-[#737373] block text-[10px]">ORDER ID</span>
                        <span className="font-bold text-black">{ord.order_number}</span>
                      </div>
                      <div>
                        <span className="text-[#737373] block text-[10px]">DATE PLACED</span>
                        <span className="text-[#404040]">
                          {new Date(ord.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#737373] block text-[10px]">STATUS</span>
                        <span className="px-2 py-0.5 bg-black text-white text-[9px] uppercase font-bold">
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[#737373] block text-[10px]">TOTAL</span>
                        <span className="font-bold text-black">
                          ₹{parseFloat(ord.total_amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <Link
                        to={`/order-success/${ord.id}`}
                        className="px-3 py-1.5 border border-black text-black text-xs font-semibold uppercase hover:bg-black hover:text-white transition-colors"
                      >
                        View Receipt
                      </Link>
                    </div>
                  </div>

                  {/* Order items preview */}
                  <div className="p-4 sm:p-6 divide-y divide-[#F5F5F5]">
                    {ord.items?.map((item, idx) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-16 bg-[#F5F5F5] border border-[#E5E5E5] overflow-hidden flex-shrink-0 relative">
                            {item.image && (
                              <img src={item.image} alt="" className="w-full h-full object-cover grayscale" />
                            )}
                            {item.isCustomized && (
                              <span className="absolute bottom-0 inset-x-0 bg-black text-white text-[7px] text-center font-mono uppercase">
                                Custom
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase text-black">{item.productName}</p>
                            <p className="text-[10px] font-mono text-[#737373]">
                              {item.size} • {item.color} • Qty {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-black">
                          ₹{parseFloat(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Saved Addresses */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="p-6 border border-[#E5E5E5] bg-[#FAFAFA] space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-[#E5E5E5]">
                <span className="font-bold uppercase text-black">{addr.full_name}</span>
                {addr.is_default && (
                  <span className="px-2 py-0.5 bg-black text-white text-[9px] uppercase">Default</span>
                )}
              </div>
              <p className="text-[#404040]">{addr.address_line1}</p>
              {addr.address_line2 && <p className="text-[#737373]">{addr.address_line2}</p>}
              <p className="text-[#737373]">{addr.city}, {addr.state} - {addr.postal_code}</p>
              <p className="text-[#737373]">Phone: {addr.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountPage;
