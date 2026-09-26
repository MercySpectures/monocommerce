import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  return (
    <footer className="bg-[#0A0A0A] text-white border-t border-[#262626] pt-16 pb-12 mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#262626]">
          {/* Newsletter Column */}
          <div className="md:col-span-5 space-y-4">
            <span className="text-[11px] font-mono tracking-widest text-[#737373] uppercase block">
              // ARCHIVAL DISPATCHES
            </span>
            <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white font-editorial">
              Join the Archival Circle
            </h3>
            <p className="text-xs text-[#A3A3A3] leading-relaxed max-w-sm">
              Receive limited release notices, private studio access, and editorial drops. Zero promotional clutter.
            </p>

            <form onSubmit={handleSubscribe} className="pt-2">
              <div className="flex border-b border-[#404040] focus-within:border-white transition-colors py-2">
                <input
                  type="email"
                  placeholder="ENTER YOUR EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder-[#737373] focus:outline-none w-full uppercase font-mono tracking-wider"
                  required
                />
                <button
                  type="submit"
                  className="text-white hover:text-[#A3A3A3] transition-colors p-1"
                  aria-label="Subscribe"
                >
                  {subscribed ? <Check size={16} /> : <ArrowUpRight size={18} />}
                </button>
              </div>
              {subscribed && (
                <p className="text-[10px] text-white font-mono uppercase mt-2 tracking-widest">
                  ✓ Dispatch subscription recorded. Welcome to the circle.
                </p>
              )}
            </form>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1" />

          {/* Links Column 1: Collections */}
          <div className="md:col-span-2 space-y-4">
            <span className="text-[11px] font-mono tracking-widest text-[#737373] uppercase block">
              CATALOG
            </span>
            <ul className="space-y-2.5 text-xs uppercase tracking-wider text-[#A3A3A3]">
              <li><Link to="/shop?category=t-shirts" className="hover:text-white transition-colors">T-Shirts</Link></li>
              <li><Link to="/shop?category=hoodies" className="hover:text-white transition-colors">Hoodies</Link></li>
              <li><Link to="/shop?category=caps" className="hover:text-white transition-colors">Caps & Hats</Link></li>
              <li><Link to="/shop?category=bags" className="hover:text-white transition-colors">Bags & Carriers</Link></li>
              <li><Link to="/shop?isNewArrival=true" className="hover:text-white transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Links Column 2: Studio */}
          <div className="md:col-span-2 space-y-4">
            <span className="text-[11px] font-mono tracking-widest text-[#737373] uppercase block">
              STUDIO
            </span>
            <ul className="space-y-2.5 text-xs uppercase tracking-wider text-[#A3A3A3]">
              <li><Link to="/customize/archival-heavyweight-tshirt" className="hover:text-white transition-colors">Customizer Studio</Link></li>
              <li><Link to="/shop?isCustomizable=true" className="hover:text-white transition-colors">Printable Pieces</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Design Manifesto</Link></li>
              <li><Link to="/account" className="hover:text-white transition-colors">Order Tracking</Link></li>
            </ul>
          </div>

          {/* Links Column 3: Client Service */}
          <div className="md:col-span-2 space-y-4">
            <span className="text-[11px] font-mono tracking-widest text-[#737373] uppercase block">
              SERVICE
            </span>
            <ul className="space-y-2.5 text-xs uppercase tracking-wider text-[#A3A3A3]">
              <li><span className="text-[#737373]">Domestic: 2-4 Days</span></li>
              <li><span className="text-[#737373]">Returns: 14 Days</span></li>
              <li><span className="text-[#737373]">Care Guide: Cold Wash</span></li>
              <li><span className="text-[#737373]">support@monocommerce.com</span></li>
            </ul>
          </div>
        </div>

        {/* Oversized STREETECH-style Brand Typography */}
        <div className="py-12 border-b border-[#262626] overflow-hidden select-none">
          <h2 className="text-[clamp(44px,12vw,160px)] font-black uppercase tracking-tighter leading-none text-[#171717] text-center font-editorial hover:text-[#262626] transition-colors duration-500">
            MONOCOMMERCE
          </h2>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] font-mono text-[#737373] uppercase tracking-widest gap-4">
          <div>
            © 2026 MONOCOMMERCE® LTD. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6">
            <span>CURRENCY: INR (₹)</span>
            <span>SHIPPING: INDIA & GLOBAL</span>
            <span>EDITION: SS-26</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
