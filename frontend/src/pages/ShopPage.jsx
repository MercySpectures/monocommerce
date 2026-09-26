import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ChevronDown, Sparkles, RotateCcw } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import api from '../services/api';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { name: 'Jet Black', hex: '#0A0A0A' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Charcoal Gray', hex: '#262626' },
  { name: 'Heather Slate', hex: '#737373' },
];

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States from URL or defaults
  const activeCategory = searchParams.get('category') || '';
  const activeSize = searchParams.get('size') || '';
  const activeColor = searchParams.get('color') || '';
  const isCustomizable = searchParams.get('isCustomizable') === 'true';
  const isNewArrival = searchParams.get('isNewArrival') === 'true';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/products/categories');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products when searchParams change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams(searchParams);
        const res = await api.get(`/products?${queryParams.toString()}`);
        if (res.data.success) {
          setProducts(res.data.data.products);
          setTotalCount(res.data.data.pagination.total);
        }
      } catch (err) {
        console.error('Error fetching shop products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = !!(
    activeCategory || activeSize || activeColor || isCustomizable || isNewArrival || minPrice || maxPrice
  );

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12 space-y-8">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#E5E5E5] gap-4">
        <div>
          <span className="text-[11px] font-mono text-[#737373] tracking-widest uppercase block mb-1">
            CATALOG // SS-26
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-black font-editorial">
            All Silhouettes
          </h1>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center justify-between md:justify-end gap-4">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2 border border-[#E5E5E5] text-xs font-bold uppercase tracking-wider text-black"
          >
            <Filter size={14} />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#737373]">
            <span>SORT:</span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-transparent text-black font-semibold uppercase focus:outline-none cursor-pointer border-b border-black pb-0.5"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="featured">Archival Featured</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar (col 3) */}
        <aside className="hidden md:block md:col-span-3 space-y-8 pr-6 border-r border-[#E5E5E5]">
          {/* Active filter reset */}
          {hasActiveFilters && (
            <div className="pb-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-[#737373]">Filters Active</span>
              <button
                onClick={clearAllFilters}
                className="text-xs text-black font-bold uppercase underline flex items-center gap-1 hover:opacity-75"
              >
                <RotateCcw size={12} /> Clear All
              </button>
            </div>
          )}

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">Category</h3>
            <div className="space-y-1 text-xs uppercase tracking-wider">
              <button
                onClick={() => updateParam('category', '')}
                className={`block w-full text-left py-1 transition-colors ${
                  !activeCategory ? 'font-bold text-black' : 'text-[#737373] hover:text-black'
                }`}
              >
                All Pieces
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateParam('category', c.slug)}
                  className={`block w-full text-left py-1 transition-colors ${
                    activeCategory === c.slug ? 'font-bold text-black' : 'text-[#737373] hover:text-black'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Studio Ready / Customizable */}
          <div className="space-y-3 pt-6 border-t border-[#E5E5E5]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">Studio Customizer</h3>
            <label className="flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer text-[#404040]">
              <input
                type="checkbox"
                checked={isCustomizable}
                onChange={(e) => updateParam('isCustomizable', e.target.checked ? 'true' : '')}
                className="accent-black w-4 h-4"
              />
              <span className="flex items-center gap-1">
                <Sparkles size={12} /> Studio Ready Only
              </span>
            </label>
          </div>

          {/* Sizes */}
          <div className="space-y-3 pt-6 border-t border-[#E5E5E5]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">Size</h3>
            <div className="grid grid-cols-3 gap-1.5">
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  onClick={() => updateParam('size', activeSize === sz ? '' : sz)}
                  className={`py-1.5 text-xs font-mono font-bold uppercase border transition-colors ${
                    activeSize === sz
                      ? 'border-black bg-black text-white'
                      : 'border-[#E5E5E5] text-black hover:border-black'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-3 pt-6 border-t border-[#E5E5E5]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">Color (Monochrome)</h3>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((col) => (
                <button
                  key={col.name}
                  onClick={() => updateParam('color', activeColor === col.name ? '' : col.name)}
                  className={`w-7 h-7 rounded-full border transition-all ${
                    activeColor === col.name ? 'ring-2 ring-black ring-offset-2 border-black scale-110' : 'border-[#D4D4D4]'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                />
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3 pt-6 border-t border-[#E5E5E5]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">Price Range (₹)</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateParam('minPrice', e.target.value)}
                className="w-full px-2 py-1.5 border border-[#E5E5E5] text-xs font-mono focus:outline-none focus:border-black"
              />
              <span className="text-[#737373]">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
                className="w-full px-2 py-1.5 border border-[#E5E5E5] text-xs font-mono focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </aside>

        {/* Product Grid Area (col 9) */}
        <main className="col-span-1 md:col-span-9 space-y-6">
          {/* Result Count and Active Tags */}
          <div className="flex items-center justify-between text-xs font-mono text-[#737373] uppercase">
            <span>Showing {products.length} of {totalCount} items</span>
          </div>

          {loading ? (
            <div className="py-24 text-center text-xs font-mono uppercase tracking-widest text-[#737373]">
              Updating catalog selection...
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center border border-[#E5E5E5] p-8 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                Nothing matched your filter criteria
              </h3>
              <p className="text-xs text-[#737373] max-w-sm mx-auto">
                Try widening your price range, clearing active sizes, or resetting all filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#262626]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
              <span className="text-xs font-bold uppercase tracking-wider text-black">Filter Collection</span>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-black">Categories</h4>
              <button
                onClick={() => { updateParam('category', ''); setMobileFilterOpen(false); }}
                className={`block w-full text-left py-1 text-xs uppercase ${!activeCategory ? 'font-bold' : 'text-[#737373]'}`}
              >
                All Pieces
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { updateParam('category', c.slug); setMobileFilterOpen(false); }}
                  className={`block w-full text-left py-1 text-xs uppercase ${activeCategory === c.slug ? 'font-bold' : 'text-[#737373]'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Studio Ready */}
            <div className="pt-4 border-t border-[#E5E5E5]">
              <label className="flex items-center gap-2 text-xs uppercase">
                <input
                  type="checkbox"
                  checked={isCustomizable}
                  onChange={(e) => updateParam('isCustomizable', e.target.checked ? 'true' : '')}
                  className="accent-black w-4 h-4"
                />
                <span>Studio Ready Pieces Only</span>
              </label>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest mt-8"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
