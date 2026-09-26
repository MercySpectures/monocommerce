import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 space-y-16">
      <div className="space-y-4">
        <span className="text-[11px] font-mono text-[#737373] tracking-widest uppercase block">
          // ARCHIVAL MANIFESTO
        </span>
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-black font-editorial leading-none">
          Form Follows Texture
        </h1>
        <p className="text-base text-[#404040] leading-relaxed pt-2">
          MonoCommerce was founded on a singular premise: contemporary streetwear is overwhelmed by fleeting color trends and disposable synthetic blends. We design solely in monochrome, emphasizing garment weight, silhouette structure, and bespoke personalization.
        </p>
      </div>

      {/* Philosophy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#E5E5E5]">
        <div className="p-6 border border-[#E5E5E5] space-y-2 bg-[#FAFAFA]">
          <span className="text-xs font-mono font-bold text-black">01 // WEIGHT</span>
          <h3 className="text-sm font-bold uppercase text-black">280–450 GSM Cottons</h3>
          <p className="text-xs text-[#737373] leading-relaxed">
            Every garment features substantial, pre-shrunk combed cotton jersey or loopback fleece engineered to maintain its boxy architecture indefinitely.
          </p>
        </div>

        <div className="p-6 border border-[#E5E5E5] space-y-2 bg-[#FAFAFA]">
          <span className="text-xs font-mono font-bold text-black">02 // RESTRAINT</span>
          <h3 className="text-sm font-bold uppercase text-black">Monochrome Exclusivity</h3>
          <p className="text-xs text-[#737373] leading-relaxed">
            By eliminating chromatic distraction, attention is directed entirely to cut, stitch precision, and textural tactile depth.
          </p>
        </div>

        <div className="p-6 border border-[#E5E5E5] space-y-2 bg-[#FAFAFA]">
          <span className="text-xs font-mono font-bold text-black">03 // CO-CREATION</span>
          <h3 className="text-sm font-bold uppercase text-black">Bespoke Studio</h3>
          <p className="text-xs text-[#737373] leading-relaxed">
            Our interactive 2D atelier enables customers to upload graphics, configure typography, and produce made-to-order archival editions.
          </p>
        </div>
      </div>

      {/* Atelier specifications */}
      <div className="p-8 bg-black text-white space-y-4">
        <span className="text-[10px] font-mono text-[#737373] uppercase tracking-widest block">
          ATELIER & PRODUCTION
        </span>
        <h3 className="text-xl font-bold uppercase tracking-tight">Bengaluru, India</h3>
        <p className="text-xs text-[#A3A3A3] leading-relaxed max-w-xl">
          Designed, customized, and dispatched directly from our dedicated atelier in Indiranagar, Bengaluru. We collaborate exclusively with ethical ethical spinning mills committed to zero-discharge dyeing.
        </p>
        <div className="pt-2">
          <Link
            to="/customize/archival-heavyweight-tshirt"
            className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-white underline hover:opacity-75"
          >
            <Sparkles size={14} /> Enter Custom Studio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
