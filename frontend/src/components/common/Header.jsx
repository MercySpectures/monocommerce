import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, Shield, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import SearchModal from './SearchModal';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Shop All', path: '/shop' },
    { name: 'T-Shirts', path: '/shop?category=t-shirts' },
    { name: 'Hoodies', path: '/shop?category=hoodies' },
    { name: 'Custom Studio', path: '/customize/archival-heavyweight-tshirt', highlight: true },
    { name: 'Caps & Bags', path: '/shop?category=caps' },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#000000] text-white text-[11px] font-medium tracking-widest uppercase py-2 px-4 text-center border-b border-[#262626] flex items-center justify-center gap-4">
        <span>COMPLIMENTARY DOMESTIC SHIPPING ON ORDERS ABOVE ₹2,500</span>
        <span className="hidden md:inline text-[#737373]">|</span>
        <span className="hidden md:inline text-[#D4D4D4] font-mono">USE CODE: MONO10 FOR 10% OFF</span>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] py-3.5 shadow-xs' : 'bg-white py-5 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-1 text-black hover:opacity-70 transition-opacity"
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>

          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="group flex items-baseline gap-1">
              <span className="text-xl md:text-2xl font-black tracking-tighter text-black uppercase font-editorial">
                MONOCOMMERCE
              </span>
              <span className="text-[10px] font-mono text-[#737373] tracking-widest">®</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-widest text-[#262626]">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-1 hover:text-black transition-colors ${
                  link.highlight
                    ? 'text-black flex items-center gap-1.5'
                    : location.pathname + location.search === link.path
                    ? 'text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-black'
                    : 'text-[#404040]'
                }`}
              >
                {link.highlight && <Sparkles size={12} className="text-black inline" />}
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Header Action Icons */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1 text-[#262626] hover:text-black transition-colors"
              aria-label="Search catalog"
            >
              <Search size={20} strokeWidth={2} />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-1 text-[#262626] hover:text-black transition-colors relative"
              aria-label="Saved items"
            >
              <Heart size={20} strokeWidth={2} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-mono font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Admin Badge or Link */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden lg:flex items-center gap-1 px-2.5 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest border border-black hover:bg-[#262626] transition-colors"
              >
                <Shield size={12} />
                <span>Admin</span>
              </Link>
            )}

            {/* Account dropdown / link */}
            <div className="relative group">
              <Link
                to={isAuthenticated ? '/account' : '/auth'}
                className="p-1 text-[#262626] hover:text-black transition-colors flex items-center gap-1"
                aria-label="Account"
              >
                <User size={20} strokeWidth={2} />
              </Link>
              {isAuthenticated && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E5E5E5] shadow-lg py-2 hidden group-hover:block animate-fade-in">
                  <div className="px-4 py-2 border-b border-[#E5E5E5]">
                    <p className="text-xs font-bold text-black uppercase truncate">{user?.name}</p>
                    <p className="text-[10px] text-[#737373] truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/account"
                    className="block px-4 py-2 text-xs uppercase tracking-wider text-[#404040] hover:text-black hover:bg-[#F5F5F5]"
                  >
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-xs uppercase tracking-wider text-black font-semibold hover:bg-[#F5F5F5]"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-xs uppercase tracking-wider text-[#737373] hover:text-black hover:bg-[#F5F5F5]"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Bag / Cart trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1 text-black hover:opacity-75 transition-opacity relative flex items-center gap-1.5"
              aria-label="Shopping bag"
            >
              <ShoppingBag size={20} strokeWidth={2} />
              <span className="font-mono text-xs font-bold text-black tracking-tighter">
                [{itemCount}]
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-6 border-r border-[#E5E5E5]">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#E5E5E5]">
                <span className="text-lg font-black uppercase tracking-tight font-editorial">MONOCOMMERCE</span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={22} />
                </button>
              </div>

              <nav className="mt-8 flex flex-col space-y-5 text-sm uppercase tracking-widest font-semibold">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="hover:translate-x-1 transition-transform flex items-center gap-2 text-black"
                  >
                    {link.highlight && <Sparkles size={14} />}
                    {link.name}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-black flex items-center gap-2 pt-2 border-t border-[#E5E5E5]"
                  >
                    <Shield size={14} /> Admin Dashboard
                  </Link>
                )}
                <Link to={isAuthenticated ? '/account' : '/auth'} className="text-[#737373] hover:text-black pt-4">
                  {isAuthenticated ? 'My Account / Orders' : 'Sign In / Register'}
                </Link>
              </nav>
            </div>

            <div className="pt-6 border-t border-[#E5E5E5] text-[11px] text-[#737373] uppercase tracking-wider space-y-2">
              <p>Archival Streetwear & Custom Studio</p>
              <p className="font-mono text-black font-semibold">Bengaluru, India</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;
