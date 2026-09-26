import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Sparkles, Layers, ShoppingCart, Users,
  Ticket, Star, Settings, ArrowLeft, LogOut, Search, Plus, Trash2,
  Check, X, Eye, Edit3, AlertTriangle, TrendingUp, RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboardPage = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Modals & form state
  const [newProductModal, setNewProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    categoryId: '',
    basePrice: '',
    discountPercent: 0,
    isCustomizable: false,
    sku: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000',
  });

  const [newCouponModal, setNewCouponModal] = useState(false);
  const [newCouponForm, setNewCouponForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 1500,
  });

  const [inspectCustomModal, setInspectCustomModal] = useState(null);

  // Fetch data depending on active tab
  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        if (activeTab === 'dashboard') {
          const res = await api.get('/admin/dashboard');
          if (res.data.success) setStatsData(res.data.data);
        } else if (activeTab === 'orders') {
          const res = await api.get('/admin/orders');
          if (res.data.success) setOrders(res.data.data.orders);
        } else if (activeTab === 'custom-orders') {
          const res = await api.get('/admin/custom-orders');
          if (res.data.success) setCustomOrders(res.data.data);
        } else if (activeTab === 'products') {
          const res = await api.get('/admin/products');
          if (res.data.success) setProducts(res.data.data);
        } else if (activeTab === 'inventory') {
          const res = await api.get('/admin/inventory');
          if (res.data.success) setInventory(res.data.data);
        } else if (activeTab === 'customers') {
          const res = await api.get('/admin/customers');
          if (res.data.success) setCustomers(res.data.data);
        } else if (activeTab === 'coupons') {
          const res = await api.get('/admin/coupons');
          if (res.data.success) setCoupons(res.data.data);
        } else if (activeTab === 'reviews') {
          const res = await api.get('/admin/reviews');
          if (res.data.success) setReviews(res.data.data);
        }
      } catch (err) {
        console.error(`Failed to load ${activeTab}:`, err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 border border-[#262626] bg-[#171717] space-y-6 text-center">
          <div className="w-12 h-12 rounded-full border border-[#404040] mx-auto flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-tight font-editorial">
            Admin Access Required
          </h2>
          <p className="text-xs text-[#A3A3A3] leading-relaxed">
            You must be logged in as an administrator to access the MonoCommerce backend control panel.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/auth')}
              className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-[#E5E5E5] transition-colors"
            >
              Sign In as Admin
            </button>
            <Link to="/" className="block text-xs font-mono text-[#737373] hover:text-white underline uppercase">
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Update Order Status Handler
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // Stock update handler
  const handleStockUpdate = async (variantId, newQuantity) => {
    try {
      await api.put(`/admin/inventory/${variantId}`, { stockQuantity: newQuantity });
      setInventory((prev) =>
        prev.map((item) => (item.variant_id === variantId ? { ...item, stock_quantity: newQuantity } : item))
      );
    } catch (err) {
      console.error('Stock update failed:', err);
    }
  };

  // Review approval handler
  const handleReviewStatus = async (reviewId, newStatus) => {
    try {
      await api.put(`/admin/reviews/${reviewId}/status`, { status: newStatus });
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error('Failed to moderate review:', err);
    }
  };

  // Create Product Handler
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/products', newProductForm);
      setNewProductModal(false);
      // Refresh products
      const res = await api.get('/admin/products');
      if (res.data.success) setProducts(res.data.data);
    } catch (err) {
      console.error('Error creating product:', err);
    }
  };

  // Create Coupon Handler
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/coupons', newCouponForm);
      setNewCouponModal(false);
      const res = await api.get('/admin/coupons');
      if (res.data.success) setCoupons(res.data.data);
    } catch (err) {
      console.error('Error creating coupon:', err);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products Catalog', icon: Package },
    { id: 'custom-orders', label: 'Studio Custom Orders', icon: Sparkles, badge: customOrders.length },
    { id: 'inventory', label: 'Inventory Stock', icon: Layers },
    { id: 'orders', label: 'All Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'coupons', label: 'Coupons & Promos', icon: Ticket },
    { id: 'reviews', label: 'Reviews Moderation', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex flex-col md:flex-row antialiased">
      {/* Dark Sidebar */}
      <aside className="w-full md:w-64 bg-[#0F0F0F] border-r border-[#262626] flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Brand */}
          <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
            <div>
              <span className="text-[9px] font-mono text-[#737373] tracking-widest uppercase block">
                CONTROL ATELIER
              </span>
              <h2 className="text-base font-black uppercase tracking-tight text-white font-editorial">
                MONOCOMMERCE
              </h2>
            </div>
            <Link to="/" className="text-[10px] font-mono text-[#737373] hover:text-white uppercase flex items-center gap-1">
              <ArrowLeft size={10} /> Store
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'bg-white text-black font-bold'
                      : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[9px] px-1.5 py-0.5 font-mono ${isActive ? 'bg-black text-white' : 'bg-[#262626] text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin profile footer */}
        <div className="pt-6 border-t border-[#262626] flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-[#737373] uppercase block truncate">{user?.name}</span>
            <span className="text-[9px] text-[#A3A3A3] font-mono block">SUPERADMIN</span>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="text-[#737373] hover:text-white transition-colors p-1"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#262626] gap-4">
          <div>
            <span className="text-[10px] font-mono text-[#737373] tracking-widest uppercase block">
              MANAGEMENT CONSOLE // {activeTab.toUpperCase()}
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white font-editorial">
              {navItems.find((i) => i.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'products' && (
              <button
                onClick={() => setNewProductModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-[#E5E5E5] transition-colors"
              >
                <Plus size={14} />
                <span>New Product</span>
              </button>
            )}
            {activeTab === 'coupons' && (
              <button
                onClick={() => setNewCouponModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-[#E5E5E5] transition-colors"
              >
                <Plus size={14} />
                <span>Create Coupon</span>
              </button>
            )}
            <span className="text-[10px] font-mono text-[#737373] uppercase border border-[#262626] px-3 py-1.5">
              DATABASE: POSTGRESQL 16 // LIVE
            </span>
          </div>
        </div>

        {/* 1. DASHBOARD VIEW */}
        {activeTab === 'dashboard' && statsData && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 bg-[#171717] border border-[#262626] space-y-2">
                <span className="text-[10px] font-mono text-[#737373] uppercase block">TOTAL REVENUE</span>
                <span className="text-2xl font-bold font-mono text-white">
                  ₹{statsData.stats.totalRevenue.toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] font-mono text-[#A3A3A3] flex items-center gap-1">
                  <TrendingUp size={10} /> +18.4% vs last cycle
                </p>
              </div>

              <div className="p-6 bg-[#171717] border border-[#262626] space-y-2">
                <span className="text-[10px] font-mono text-[#737373] uppercase block">TOTAL ORDERS</span>
                <span className="text-2xl font-bold font-mono text-white">
                  {statsData.stats.totalOrders}
                </span>
                <p className="text-[10px] font-mono text-[#A3A3A3]">
                  {statsData.stats.pendingOrders} awaiting fulfillment
                </p>
              </div>

              <div className="p-6 bg-[#171717] border border-[#262626] space-y-2">
                <span className="text-[10px] font-mono text-[#737373] uppercase block">VERIFIED CUSTOMERS</span>
                <span className="text-2xl font-bold font-mono text-white">
                  {statsData.stats.totalCustomers}
                </span>
                <p className="text-[10px] font-mono text-[#A3A3A3]">Active accounts registered</p>
              </div>

              <div className="p-6 bg-[#171717] border border-[#262626] space-y-2">
                <span className="text-[10px] font-mono text-[#737373] uppercase block">LOW STOCK ALERTS</span>
                <span className="text-2xl font-bold font-mono text-white">
                  {statsData.stats.lowStockCount}
                </span>
                <p className="text-[10px] font-mono text-[#A3A3A3]">Variants below threshold</p>
              </div>
            </div>

            {/* Revenue Trend Chart & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Revenue Trend Chart (col 8) */}
              <div className="lg:col-span-8 p-6 bg-[#171717] border border-[#262626] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Revenue Velocity (7-Day Metric)
                  </h3>
                  <span className="text-[10px] font-mono text-[#737373]">INR // NET SALES</span>
                </div>

                <div className="h-48 flex items-end gap-3 pt-6 px-2">
                  {statsData.revenueTrend?.map((item, idx) => {
                    const maxRev = 50000;
                    const heightPercent = Math.max(15, (item.revenue / maxRev) * 100);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[9px] font-mono text-[#737373] opacity-0 group-hover:opacity-100 transition-opacity">
                          ₹{Math.round(item.revenue / 1000)}k
                        </span>
                        <div
                          className="w-full bg-[#262626] group-hover:bg-white transition-colors duration-200"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[10px] font-mono text-[#A3A3A3] uppercase">{item.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Products (col 4) */}
              <div className="lg:col-span-4 p-6 bg-[#171717] border border-[#262626] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white pb-3 border-b border-[#262626]">
                  Top Silhouettes Sold
                </h3>
                <div className="space-y-3">
                  {statsData.topProducts?.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#A3A3A3] truncate max-w-[180px]">{p.product_name}</span>
                      <span className="font-bold text-white">₹{parseFloat(p.total_sales).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Orders Feed */}
            <div className="p-6 bg-[#171717] border border-[#262626] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white pb-3 border-b border-[#262626]">
                Recent Inbound Orders
              </h3>
              <div className="divide-y divide-[#262626] text-xs font-mono">
                {statsData.recentOrders?.map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-white">{ord.order_number}</span>
                      <span className="text-[#737373]">{ord.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-white">₹{parseFloat(ord.total_amount).toLocaleString('en-IN')}</span>
                      <span className="px-2 py-0.5 bg-[#262626] text-white text-[9px] uppercase font-bold">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="border border-[#262626] bg-[#171717] overflow-x-auto">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="border-b border-[#262626] text-[#737373] uppercase">
                  <th className="p-4">Silhouette</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Base Price</th>
                  <th className="p-4">Variants</th>
                  <th className="p-4">Studio Ready</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#202020] transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-12 bg-[#262626] overflow-hidden flex-shrink-0">
                        {p.primary_image && <img src={p.primary_image} alt="" className="w-full h-full object-cover grayscale" />}
                      </div>
                      <span className="font-bold text-white uppercase">{p.name}</span>
                    </td>
                    <td className="p-4 text-[#A3A3A3]">{p.sku}</td>
                    <td className="p-4 text-[#A3A3A3]">{p.category_name}</td>
                    <td className="p-4 font-bold text-white">₹{parseFloat(p.base_price).toLocaleString('en-IN')}</td>
                    <td className="p-4 text-[#A3A3A3]">{p.variant_count} Sizes/Colors</td>
                    <td className="p-4">
                      {p.is_customizable ? (
                        <span className="px-2 py-0.5 bg-white text-black text-[9px] font-bold uppercase">Ready</span>
                      ) : (
                        <span className="text-[#737373]">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-[#262626] text-white text-[9px] uppercase">
                        {p.is_active ? 'Active' : 'Archived'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. CUSTOM ORDERS STUDIO HUB (HIGH PRIORITY) */}
        {activeTab === 'custom-orders' && (
          <div className="space-y-6">
            <div className="p-4 bg-[#171717] border border-[#262626] text-xs font-mono text-[#A3A3A3]">
              Bespoke customer design blueprints submitted from the interactive 2D Studio. Review coordinates, customer-uploaded logos, and text before printing.
            </div>

            {customOrders.length === 0 ? (
              <div className="py-20 text-center border border-[#262626] p-8 text-xs font-mono text-[#737373]">
                No customized studio orders in queue.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customOrders.map((ord) => {
                  const design = typeof ord.design_data === 'string' ? JSON.parse(ord.design_data) : ord.design_data;
                  return (
                    <div key={ord.order_item_id} className="p-6 bg-[#171717] border border-[#262626] space-y-4">
                      <div className="flex justify-between items-start pb-3 border-b border-[#262626]">
                        <div>
                          <span className="text-[10px] font-mono text-[#737373] uppercase">ORDER {ord.order_number}</span>
                          <h3 className="text-sm font-bold uppercase text-white">{ord.product_name}</h3>
                          <p className="text-xs text-[#A3A3A3]">{ord.customer_name} ({ord.customer_email})</p>
                        </div>
                        <span className="px-2 py-0.5 bg-white text-black text-[9px] font-mono font-bold uppercase">
                          {ord.order_status}
                        </span>
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-3 gap-2 text-xs font-mono text-[#A3A3A3]">
                        <div>GARMENT: <strong className="text-white">{ord.garment_color}</strong></div>
                        <div>SIZE: <strong className="text-white">{ord.garment_size}</strong></div>
                        <div>VIEW: <strong className="text-white">{ord.view_side}</strong></div>
                      </div>

                      {/* Design Elements Breakdown */}
                      <div className="p-3 bg-[#0F0F0F] border border-[#262626] space-y-2 text-xs font-mono">
                        <span className="text-[10px] text-[#737373] uppercase block font-bold">
                          Blueprint Elements ({design?.elements?.length || 0})
                        </span>
                        {design?.elements?.map((el, i) => (
                          <div key={i} className="flex items-center justify-between text-[#A3A3A3]">
                            <span>
                              [{el.type.toUpperCase()}] {el.type === 'text' ? `"${el.content}"` : 'Graphic Upload'}
                            </span>
                            <span className="text-[10px] text-[#737373]">
                              X:{Math.round(el.x || 0)} Y:{Math.round(el.y || 0)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setInspectCustomModal(ord)}
                          className="flex-1 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-[#E5E5E5] transition-colors"
                        >
                          Inspect Blueprint
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="border border-[#262626] bg-[#171717] overflow-x-auto">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="border-b border-[#262626] text-[#737373] uppercase">
                  <th className="p-4">SKU</th>
                  <th className="p-4">Silhouette</th>
                  <th className="p-4">Color</th>
                  <th className="p-4">Size</th>
                  <th className="p-4">In Stock</th>
                  <th className="p-4">Stock Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {inventory.map((item) => (
                  <tr key={item.variant_id} className="hover:bg-[#202020] transition-colors">
                    <td className="p-4 font-bold text-white">{item.sku}</td>
                    <td className="p-4 text-[#A3A3A3]">{item.product_name}</td>
                    <td className="p-4 text-[#A3A3A3]">{item.color_name}</td>
                    <td className="p-4 font-bold text-white">{item.size}</td>
                    <td className="p-4">
                      <span className={`font-bold font-mono ${item.stock_quantity <= 5 ? 'text-white underline' : 'text-[#A3A3A3]'}`}>
                        {item.stock_quantity} units
                      </span>
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      <button
                        onClick={() => handleStockUpdate(item.variant_id, Math.max(0, item.stock_quantity - 5))}
                        className="px-2 py-1 bg-[#262626] hover:bg-white hover:text-black text-white text-[10px] transition-colors"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => handleStockUpdate(item.variant_id, item.stock_quantity + 10)}
                        className="px-2 py-1 bg-[#262626] hover:bg-white hover:text-black text-white text-[10px] transition-colors"
                      >
                        +10
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. ALL ORDERS */}
        {activeTab === 'orders' && (
          <div className="border border-[#262626] bg-[#171717] overflow-x-auto">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="border-b border-[#262626] text-[#737373] uppercase">
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Customized</th>
                  <th className="p-4">Status & Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#202020] transition-colors">
                    <td className="p-4 font-bold text-white">{ord.order_number}</td>
                    <td className="p-4">
                      <div className="text-white">{ord.customer_name}</div>
                      <div className="text-[10px] text-[#737373]">{ord.customer_email}</div>
                    </td>
                    <td className="p-4 text-[#A3A3A3]">
                      {new Date(ord.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-4 font-bold text-white">₹{parseFloat(ord.total_amount).toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      {ord.has_customization ? (
                        <span className="px-2 py-0.5 bg-white text-black text-[9px] font-bold uppercase">Custom Piece</span>
                      ) : (
                        <span className="text-[#737373]">Standard</span>
                      )}
                    </td>
                    <td className="p-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="bg-[#262626] text-white p-1 text-xs border border-[#404040] focus:outline-none uppercase"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="printed">Printed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="border border-[#262626] bg-[#171717] overflow-x-auto">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="border-b border-[#262626] text-[#737373] uppercase">
                  <th className="p-4">Client</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Total Orders</th>
                  <th className="p-4">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#202020] transition-colors">
                    <td className="p-4 font-bold text-white uppercase">{c.name}</td>
                    <td className="p-4 text-[#A3A3A3]">{c.email}</td>
                    <td className="p-4 text-[#A3A3A3]">{c.phone || '—'}</td>
                    <td className="p-4 font-bold text-white">{c.total_orders}</td>
                    <td className="p-4 font-bold text-white">₹{parseFloat(c.total_spent).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 7. COUPONS */}
        {activeTab === 'coupons' && (
          <div className="border border-[#262626] bg-[#171717] overflow-x-auto">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="border-b border-[#262626] text-[#737373] uppercase">
                  <th className="p-4">Code</th>
                  <th className="p-4">Discount Type</th>
                  <th className="p-4">Value</th>
                  <th className="p-4">Min Order</th>
                  <th className="p-4">Times Used</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#202020] transition-colors">
                    <td className="p-4 font-bold text-white">{c.code}</td>
                    <td className="p-4 text-[#A3A3A3] uppercase">{c.discount_type}</td>
                    <td className="p-4 font-bold text-white">
                      {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                    </td>
                    <td className="p-4 text-[#A3A3A3]">₹{c.min_order_amount}</td>
                    <td className="p-4 text-[#A3A3A3]">{c.times_used}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-[#262626] text-white text-[9px] uppercase">
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 8. REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div className="border border-[#262626] bg-[#171717] divide-y divide-[#262626]">
            {reviews.map((r) => (
              <div key={r.id} className="p-6 flex items-start justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-xs">{r.user_name}</span>
                    <span className="text-[10px] font-mono text-[#737373]">★ {r.rating} / 5</span>
                    <span className="text-[10px] font-mono text-[#A3A3A3] uppercase">[{r.product_name}]</span>
                  </div>
                  {r.title && <h4 className="text-xs font-bold text-white uppercase">{r.title}</h4>}
                  <p className="text-xs text-[#A3A3A3] leading-relaxed max-w-xl">{r.comment}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[9px] font-mono uppercase ${r.status === 'approved' ? 'bg-white text-black font-bold' : 'bg-[#262626] text-white'}`}>
                    {r.status}
                  </span>
                  {r.status !== 'approved' && (
                    <button
                      onClick={() => handleReviewStatus(r.id, 'approved')}
                      className="p-1.5 bg-white text-black hover:bg-[#E5E5E5] transition-colors"
                      title="Approve"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  {r.status !== 'rejected' && (
                    <button
                      onClick={() => handleReviewStatus(r.id, 'rejected')}
                      className="p-1.5 bg-[#262626] text-white hover:bg-black transition-colors"
                      title="Reject"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Inspect Custom Blueprint Modal */}
      {inspectCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#171717] text-white max-w-lg w-full p-6 border border-[#262626] space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#262626]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Studio Blueprint // Order {inspectCustomModal.order_number}
              </h3>
              <button onClick={() => setInspectCustomModal(null)} className="text-xs font-mono uppercase underline">
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[#0F0F0F] border border-[#262626] text-xs font-mono space-y-2">
                <div>PRODUCT: <strong className="text-white">{inspectCustomModal.product_name}</strong></div>
                <div>GARMENT COLOR: <strong className="text-white">{inspectCustomModal.garment_color}</strong></div>
                <div>GARMENT SIZE: <strong className="text-white">{inspectCustomModal.garment_size}</strong></div>
                <div>CUSTOMER: <strong className="text-white">{inspectCustomModal.customer_name}</strong> ({inspectCustomModal.customer_email})</div>
              </div>

              {/* Elements detail */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#737373] uppercase">Canvas Elements</span>
                <pre className="p-4 bg-[#0F0F0F] border border-[#262626] text-[11px] font-mono text-[#A3A3A3] overflow-x-auto max-h-48">
                  {JSON.stringify(typeof inspectCustomModal.design_data === 'string' ? JSON.parse(inspectCustomModal.design_data) : inspectCustomModal.design_data, null, 2)}
                </pre>
              </div>
            </div>

            <button
              onClick={() => setInspectCustomModal(null)}
              className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-widest"
            >
              Done Inspecting
            </button>
          </div>
        </div>
      )}

      {/* New Product Modal */}
      {newProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form onSubmit={handleCreateProduct} className="bg-[#171717] text-white max-w-md w-full p-6 border border-[#262626] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#262626]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">New Archival Silhouette</h3>
              <button type="button" onClick={() => setNewProductModal(false)} className="text-xs font-mono underline uppercase">
                Cancel
              </button>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">Product Name</label>
              <input
                type="text"
                value={newProductForm.name}
                onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] text-xs font-medium text-white uppercase focus:outline-none focus:border-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">Base Price (₹)</label>
                <input
                  type="number"
                  value={newProductForm.basePrice}
                  onChange={(e) => setNewProductForm({ ...newProductForm, basePrice: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] text-xs font-mono text-white focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">Discount %</label>
                <input
                  type="number"
                  value={newProductForm.discountPercent}
                  onChange={(e) => setNewProductForm({ ...newProductForm, discountPercent: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] text-xs font-mono text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">Image URL</label>
              <input
                type="url"
                value={newProductForm.imageUrl}
                onChange={(e) => setNewProductForm({ ...newProductForm, imageUrl: e.target.value })}
                className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs uppercase cursor-pointer">
                <input
                  type="checkbox"
                  checked={newProductForm.isCustomizable}
                  onChange={(e) => setNewProductForm({ ...newProductForm, isCustomizable: e.target.checked })}
                  className="accent-white"
                />
                <span>Enable Custom Studio for this Product</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-[#E5E5E5] transition-colors"
            >
              Publish Product
            </button>
          </form>
        </div>
      )}

      {/* New Coupon Modal */}
      {newCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form onSubmit={handleCreateCoupon} className="bg-[#171717] text-white max-w-sm w-full p-6 border border-[#262626] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#262626]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Create Promo Code</h3>
              <button type="button" onClick={() => setNewCouponModal(false)} className="text-xs font-mono underline uppercase">
                Cancel
              </button>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">Coupon Code</label>
              <input
                type="text"
                placeholder="e.g. MONO15"
                value={newCouponForm.code}
                onChange={(e) => setNewCouponForm({ ...newCouponForm, code: e.target.value.toUpperCase() })}
                required
                className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] text-xs font-mono uppercase text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">Discount %</label>
              <input
                type="number"
                value={newCouponForm.discountValue}
                onChange={(e) => setNewCouponForm({ ...newCouponForm, discountValue: e.target.value })}
                required
                className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#262626] text-xs font-mono text-white focus:outline-none focus:border-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-[#E5E5E5]"
            >
              Save Coupon
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
