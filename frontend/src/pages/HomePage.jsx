import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, SlidersHorizontal, ArrowUpRight } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import api from '../services/api';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?limit=12'),
          api.get('/products/categories'),
        ]);

        if (prodRes.data.success) {
          const prods = prodRes.data.data.products;
          setFeaturedProducts(prods.filter((p) => p.is_featured).slice(0, 4));
          setNewArrivals(prods.filter((p) => p.is_new_arrival || !p.is_featured).slice(0, 4));
        }

        if (catRes.data.success) {
          setCategories(catRes.data.data);
        }
      } catch (err) {
        console.error('Home page fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-24 md:space-y-32">
      {/* 1. HERO SECTION (High-Contrast Monochrome Editorial) */}
      <section className="relative w-full border-b border-[#E5E5E5] bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 md:pt-16 pb-12 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-end">
            {/* Left Typographic Statement */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F5F5] border border-[#E5E5E5] text-[11px] font-mono uppercase tracking-widest text-[#404040]">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                <span>SEASON 2026 // MONOCHROME ESSENTIALS</span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-black leading-none font-editorial">
                ARCHIVAL
                <br />
                SILHOUETTES
              </h1>

              <p className="text-sm md:text-base text-[#404040] max-w-lg leading-relaxed">
                Heavyweight 280-450 GSM combed cottons and industrial canvas. Strict monochrome aesthetics engineered with architectural proportions and an interactive custom studio.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to="/shop"
                  className="px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#262626] transition-colors flex items-center gap-2 group"
                >
                  <span>Explore Collection</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/customize/archival-heavyweight-tshirt"
                  className="px-8 py-4 border border-black bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center gap-2"
                >
                  <Sparkles size={14} />
                  <span>Custom Studio</span>
                </Link>
              </div>
            </div>

            {/* Right Editorial Campaign Imagery */}
            <div className="lg:col-span-5 relative">
              <div className="aspect-3/4 w-full bg-[#F5F5F5] border border-[#E5E5E5] overflow-hidden relative group">
                <img
                  src="https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1200&auto=format&fit=crop"
                  alt="Editorial campaign"
                  className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-103 transition-transform duration-700"
                />
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/90 backdrop-blur-xs border border-[#E5E5E5] flex items-center justify-between text-[11px] font-mono uppercase tracking-wider">
                  <span>LOOK 01 // OVERSIZED DROP</span>
                  <Link to="/product/archival-heavyweight-tshirt" className="font-bold underline">
                    VIEW PIECE
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Sub-strip */}
        <div className="border-t border-[#E5E5E5] py-4 bg-[#F5F5F5]">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-[#737373] uppercase tracking-widest">
            <span>[01] 100% ORGANIC COMBED COTTON</span>
            <span>[02] 280-450 GSM DENSITY</span>
            <span>[03] BESPOKE STUDIO CUSTOMIZATION</span>
            <span>[04] DOMESTIC COMPLIMENTARY SHIPPING</span>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES TILES */}
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#E5E5E5] gap-4">
          <div>
            <span className="text-[11px] font-mono text-[#737373] tracking-widest uppercase block mb-1">
              CURATED CATEGORIES
            </span>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black font-editorial">
              Explore Silhouettes
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1 hover:underline"
          >
            <span>View Full Directory</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative aspect-4/5 bg-[#F5F5F5] border border-[#E5E5E5] overflow-hidden flex flex-col justify-end p-6 hover:border-black transition-colors"
            >
              <img
                src={cat.image_url}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="relative z-10 text-white space-y-1">
                <span className="text-[10px] font-mono text-[#D4D4D4] uppercase tracking-widest block">
                  CATEGORY // 0{cat.display_order}
                </span>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold uppercase tracking-tight">{cat.name}</h3>
                  <ArrowUpRight size={18} className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS (STREETECH / VELORA STYLE GRID) */}
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#E5E5E5] gap-4">
          <div>
            <span className="text-[11px] font-mono text-[#737373] tracking-widest uppercase block mb-1">
              CORE ROTATION
            </span>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black font-editorial">
              Featured Archival Pieces
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1 hover:underline"
          >
            <span>All Products ({featuredProducts.length + newArrivals.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs font-mono uppercase tracking-widest text-[#737373]">
            Loading catalog...
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. CUSTOMIZER STUDIO BANNER (HIGH CONTRAST BLACK SECTION) */}
      <section className="bg-[#000000] text-white py-16 md:py-24 border-y border-[#262626]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171717] border border-[#262626] text-[11px] font-mono uppercase tracking-widest text-[#A3A3A3]">
                <Sparkles size={12} className="text-white" />
                <span>BESPOKE STUDIO V1.0</span>
              </div>

              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-white font-editorial leading-none">
                CREATE YOUR OWN
                <br />
                ARCHIVAL T-SHIRT
              </h2>

              <p className="text-sm md:text-base text-[#A3A3A3] leading-relaxed max-w-lg">
                Upload your custom artwork, configure typographic statements, and position your design across front and back canvases in real-time. Printed with archival inks on 280 GSM dry-touch cotton.
              </p>

              {/* 4-Step Process Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#262626]">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#737373]">01</span>
                  <p className="text-xs font-bold uppercase text-white">Pick Cut</p>
                  <p className="text-[11px] text-[#737373]">Boxy or Relaxed</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#737373]">02</span>
                  <p className="text-xs font-bold uppercase text-white">Upload / Type</p>
                  <p className="text-[11px] text-[#737373]">PNG or Curated Type</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#737373]">03</span>
                  <p className="text-xs font-bold uppercase text-white">Scale & Drag</p>
                  <p className="text-[11px] text-[#737373]">Rotate on Canvas</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#737373]">04</span>
                  <p className="text-xs font-bold uppercase text-white">We Print</p>
                  <p className="text-[11px] text-[#737373]">Archival Direct</p>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/customize/archival-heavyweight-tshirt"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-[#E5E5E5] transition-colors"
                >
                  <Sparkles size={14} />
                  <span>Launch Custom Studio</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Interactive Preview Teaser */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-sm aspect-4/5 bg-[#0A0A0A] border border-[#262626] p-6 relative flex flex-col justify-between shadow-2xl">
                <div className="flex justify-between items-center text-[10px] font-mono text-[#737373] uppercase pb-3 border-b border-[#262626]">
                  <span>STUDIO PREVIEW</span>
                  <span>JET BLACK // L</span>
                </div>

                <div className="flex-1 flex items-center justify-center relative">
                  <img
                    src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000"
                    alt="Customizer mockup"
                    className="w-full h-full object-contain grayscale contrast-125"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="px-4 py-2 border border-white/40 bg-black/60 backdrop-blur-xs text-center">
                      <span className="text-sm font-bold uppercase tracking-widest text-white font-editorial block">
                        ARCHIVAL THEORY
                      </span>
                      <span className="text-[9px] font-mono text-[#A3A3A3] uppercase">
                        EDITION 001 // BENGALURU
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#262626] flex items-center justify-between text-[11px] font-mono text-[#A3A3A3]">
                  <span>INTERACTIVE 2D CANVAS</span>
                  <span className="text-white font-bold">READY TO WEAR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#E5E5E5] gap-4">
          <div>
            <span className="text-[11px] font-mono text-[#737373] tracking-widest uppercase block mb-1">
              JUST DISPATCHED
            </span>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black font-editorial">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/shop?isNewArrival=true"
            className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1 hover:underline"
          >
            <span>View All New</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. EDITORIAL BRAND STATEMENT */}
      <section className="border-y border-[#E5E5E5] py-20 md:py-28 bg-[#FAFAFA]">
        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center space-y-6">
          <span className="text-[11px] font-mono text-[#737373] uppercase tracking-widest block">
            // DESIGN PRINCIPLES
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-black font-editorial leading-tight">
            &quot;FORM FOLLOWS TEXTURE. ZERO COLOR DISTRACTIONS.&quot;
          </h2>
          <p className="text-sm md:text-base text-[#404040] max-w-2xl mx-auto leading-relaxed">
            MonoCommerce eliminates transient color trends in favor of timeless textural permanence. Heavy diagonal loops, compact dry-finish jerseys, and industrial hardware. Crafted for collectors who appreciate restraint.
          </p>
          <div className="pt-4">
            <Link
              to="/about"
              className="text-xs font-bold uppercase tracking-widest text-black underline hover:opacity-75"
            >
              Read Design Manifesto
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
