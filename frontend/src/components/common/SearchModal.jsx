import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products?search=${encodeURIComponent(query.trim())}&limit=6`);
        if (res.data.success) {
          setResults(res.data.data.products);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-start bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full bg-white border-b border-[#E5E5E5] px-6 py-6 md:px-12 md:py-8 shadow-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-3 w-full">
              <Search size={22} className="text-[#737373]" />
              <input
                ref={inputRef}
                type="text"
                placeholder="SEARCH APPAREL, ACCESSORIES, SILHOUETTES..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-lg md:text-xl font-medium tracking-tight bg-transparent text-black placeholder-[#A3A3A3] focus:outline-none uppercase"
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#737373] hover:text-black transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Results preview */}
          <div className="mt-6 max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="py-8 text-center text-xs tracking-widest uppercase text-[#737373]">
                Searching catalog...
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm font-medium text-black">Nothing matched your search.</p>
                <p className="text-xs text-[#737373] mt-1">Try keywords like &apos;T-Shirt&apos;, &apos;Hoodie&apos;, &apos;Cap&apos;, or &apos;Bag&apos;.</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 border border-[#E5E5E5] hover:border-black transition-colors group"
                  >
                    <div className="w-16 h-20 bg-[#F5F5F5] overflow-hidden flex-shrink-0">
                      {product.images?.[0]?.imageUrl && (
                        <img
                          src={product.images[0].imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] tracking-widest text-[#737373] uppercase block mb-1">
                        {product.category_name}
                      </span>
                      <h4 className="text-sm font-semibold text-black truncate uppercase tracking-tight">
                        {product.name}
                      </h4>
                      <p className="text-xs font-medium text-[#262626] mt-1">
                        ₹{product.discountPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-[#A3A3A3] group-hover:text-black group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};

export default SearchModal;
