import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Upload, Type, Trash2, RotateCw, ZoomIn, Eye, ArrowLeft,
  Check, Undo2, Redo2, RefreshCw, ShoppingBag, Move, ChevronRight
} from 'lucide-react';
import TShirtMockup from '../components/customizer/TShirtMockup';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const GARMENT_COLORS = [
  { name: 'Jet Black', hex: '#0A0A0A', textColor: '#FFFFFF' },
  { name: 'Pure White', hex: '#FFFFFF', textColor: '#0A0A0A' },
  { name: 'Charcoal Gray', hex: '#262626', textColor: '#FFFFFF' },
  { name: 'Heather Slate', hex: '#737373', textColor: '#FFFFFF' },
];

const FONTS = [
  { name: 'Manrope', className: 'font-editorial' },
  { name: 'Inter', className: 'font-sans-clean' },
  { name: 'Space Grotesk', className: 'font-display' },
  { name: 'Bebas Neue', className: 'font-headline' },
  { name: 'JetBrains Mono', className: 'font-mono-code' },
];

const TEXT_COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Off-White', hex: '#E5E5E5' },
  { name: 'Silver Gray', hex: '#A3A3A3' },
  { name: 'Dark Gray', hex: '#262626' },
  { name: 'Black', hex: '#000000' },
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const CustomizerStudioPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSide, setActiveSide] = useState('front'); // 'front' | 'back'
  const [garmentColor, setGarmentColor] = useState(GARMENT_COLORS[0]);
  const [garmentSize, setGarmentSize] = useState('L');
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'image' | 'garment'
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Canvas elements state per side
  const [frontElements, setFrontElements] = useState([
    {
      id: 'txt-default',
      type: 'text',
      content: 'ARCHIVAL THEORY',
      fontFamily: 'Manrope',
      fontSize: 24,
      textColor: '#FFFFFF',
      x: 100,
      y: 110,
      rotation: 0,
      scale: 1,
      side: 'front',
    },
  ]);
  const [backElements, setBackElements] = useState([]);
  const [selectedId, setSelectedId] = useState('txt-default');

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const printAreaRef = useRef(null);

  // Load product
  useEffect(() => {
    const fetchProd = async () => {
      try {
        setLoading(true);
        const slug = productId || 'archival-heavyweight-tshirt';
        const res = await api.get(`/products/${slug}`);
        if (res.data.success) {
          setProduct(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching studio product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProd();
  }, [productId]);

  const activeElements = activeSide === 'front' ? frontElements : backElements;
  const setActiveElements = activeSide === 'front' ? setFrontElements : setBackElements;
  const selectedElement = activeElements.find((el) => el.id === selectedId);

  // Update selected element property
  const updateSelected = (key, value) => {
    if (!selectedId) return;
    setActiveElements((prev) =>
      prev.map((el) => (el.id === selectedId ? { ...el, [key]: value } : el))
    );
  };

  // Add new Text Element
  const handleAddText = () => {
    const newEl = {
      id: 'txt-' + Date.now(),
      type: 'text',
      content: 'CUSTOM TEXT',
      fontFamily: 'Manrope',
      fontSize: 22,
      textColor: garmentColor.textColor,
      x: 100,
      y: 140,
      rotation: 0,
      scale: 1,
      side: activeSide,
    };
    setActiveElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
    setActiveTab('text');
  };

  // Upload Image Element
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/customizations/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        const newImg = {
          id: 'img-' + Date.now(),
          type: 'image',
          url: res.data.data.url,
          filename: res.data.data.filename,
          x: 90,
          y: 90,
          scale: 1,
          rotation: 0,
          width: 140,
          side: activeSide,
        };
        setActiveElements((prev) => [...prev, newImg]);
        setSelectedId(newImg.id);
        setActiveTab('image');
      }
    } catch {
      // Local fallback preview if backend upload fails
      const localUrl = URL.createObjectURL(file);
      const newImg = {
        id: 'img-' + Date.now(),
        type: 'image',
        url: localUrl,
        filename: file.name,
        x: 90,
        y: 90,
        scale: 1,
        rotation: 0,
        width: 140,
        side: activeSide,
      };
      setActiveElements((prev) => [...prev, newImg]);
      setSelectedId(newImg.id);
      setActiveTab('image');
    }
  };

  // Remove element
  const handleRemoveElement = (id) => {
    setActiveElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  // Drag interaction
  const handlePointerDown = (e, id) => {
    e.stopPropagation();
    setSelectedId(id);
    isDraggingRef.current = true;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialElX: activeElements.find((el) => el.id === id)?.x || 0,
      initialElY: activeElements.find((el) => el.id === id)?.y || 0,
    };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !selectedId) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    const newX = Math.max(10, Math.min(230, dragStartRef.current.initialElX + dx));
    const newY = Math.max(10, Math.min(270, dragStartRef.current.initialElY + dy));

    setActiveElements((prev) =>
      prev.map((el) => (el.id === selectedId ? { ...el, x: newX, y: newY } : el))
    );
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Reset current side elements
  const handleReset = () => {
    setActiveElements([]);
    setSelectedId(null);
  };

  // Save customization & Add to Cart
  const handleAddToCart = async () => {
    if (!product) return;
    setSaving(true);

    try {
      const designPayload = {
        garmentColor: garmentColor.name,
        garmentSize,
        elements: [...frontElements, ...backElements],
      };

      const res = await api.post('/customizations', {
        productId: product.id,
        garmentColor: garmentColor.name,
        garmentSize,
        viewSide: backElements.length > 0 ? 'both' : 'front',
        designData: designPayload,
        previewImageUrl: product.images?.[0]?.imageUrl || '',
      });

      const customId = res.data?.data?.id || 'custom_' + Date.now();

      await addToCart({
        productId: product.id,
        productName: `${product.name} (Custom Studio Edition)`,
        price: product.discountPrice || product.base_price,
        size: garmentSize,
        color: garmentColor.name,
        quantity: 1,
        customizationId: customId,
        primaryImage: product.images?.[0]?.imageUrl || '',
        customizationData: designPayload,
      });

      setSaving(false);
    } catch (err) {
      console.error('Failed to save customization:', err);
      // Fallback
      await addToCart({
        productId: product.id,
        productName: `${product.name} (Custom Studio Edition)`,
        price: product.discountPrice || product.base_price,
        size: garmentSize,
        color: garmentColor.name,
        quantity: 1,
        customizationId: 'custom_local_' + Date.now(),
        primaryImage: product.images?.[0]?.imageUrl || '',
      });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-xs uppercase tracking-widest font-mono text-[#737373]">
          Loading Studio Canvas...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F5F5F5] select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Studio Navigation Top Bar */}
      <div className="bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-1 text-[#737373] hover:text-black transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#737373] uppercase block">
              BESPOKE STUDIO V1.0
            </span>
            <h1 className="text-sm font-bold uppercase tracking-tight text-black">
              {product?.name || 'Archival Heavyweight T-Shirt'}
            </h1>
          </div>
        </div>

        {/* View toggle (Front / Back) & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex bg-[#F5F5F5] border border-[#E5E5E5] p-0.5">
            <button
              onClick={() => setActiveSide('front')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                activeSide === 'front' ? 'bg-black text-white' : 'text-[#737373] hover:text-black'
              }`}
            >
              Front View
            </button>
            <button
              onClick={() => setActiveSide('back')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                activeSide === 'back' ? 'bg-black text-white' : 'text-[#737373] hover:text-black'
              }`}
            >
              Back View
            </button>
          </div>

          <button
            onClick={() => setPreviewModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E5E5] bg-white text-xs font-semibold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: Interactive Canvas Workspace (col 7) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[480px] aspect-4/5 bg-white border border-[#E5E5E5] relative flex items-center justify-center p-6 shadow-xs overflow-hidden">
            {/* Realistic T-Shirt Mockup */}
            <div className="w-full h-full relative flex items-center justify-center">
              <TShirtMockup color={garmentColor.hex} isBack={activeSide === 'back'} />

              {/* Printable Bounding Area */}
              <div
                ref={printAreaRef}
                className="absolute w-[240px] h-[300px] top-[140px] border border-dashed border-[#A3A3A3]/60 z-20 pointer-events-auto overflow-hidden"
              >
                {/* Printable zone indicator */}
                <div className="absolute top-1 left-1 text-[8px] font-mono uppercase tracking-widest text-[#737373] opacity-50 select-none">
                  PRINT ZONE // {activeSide.toUpperCase()}
                </div>

                {/* Render Elements */}
                {activeElements.map((el) => {
                  const isSelected = el.id === selectedId;

                  if (el.type === 'text') {
                    return (
                      <div
                        key={el.id}
                        onPointerDown={(e) => handlePointerDown(e, el.id)}
                        className={`absolute cursor-move select-none p-1 transition-shadow ${
                          isSelected ? 'outline-1 outline-black outline-dashed bg-black/10' : ''
                        }`}
                        style={{
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          transform: `rotate(${el.rotation}deg) scale(${el.scale})`,
                          transformOrigin: 'center center',
                        }}
                      >
                        <span
                          className={`font-bold uppercase tracking-wide block whitespace-nowrap ${
                            FONTS.find((f) => f.name === el.fontFamily)?.className || 'font-editorial'
                          }`}
                          style={{
                            fontSize: `${el.fontSize}px`,
                            color: el.textColor,
                            textShadow: el.textColor === '#FFFFFF' ? '0 1px 2px rgba(0,0,0,0.4)' : 'none',
                          }}
                        >
                          {el.content}
                        </span>
                      </div>
                    );
                  }

                  if (el.type === 'image') {
                    return (
                      <div
                        key={el.id}
                        onPointerDown={(e) => handlePointerDown(e, el.id)}
                        className={`absolute cursor-move select-none p-1 ${
                          isSelected ? 'outline-1 outline-black outline-dashed bg-black/10' : ''
                        }`}
                        style={{
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width * el.scale}px`,
                          transform: `rotate(${el.rotation}deg)`,
                          transformOrigin: 'center center',
                        }}
                      >
                        <img
                          src={el.url}
                          alt="Graphic element"
                          className="w-full h-auto object-contain pointer-events-none filter drop-shadow-sm"
                        />
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>

            {/* Quick canvas controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-[#737373]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-black" />
                <span className="uppercase">SILHOUETTE: 280 GSM OVERSIZED</span>
              </div>
              <button
                onClick={handleReset}
                className="hover:text-black flex items-center gap-1 uppercase transition-colors"
              >
                <RefreshCw size={12} />
                <span>Reset Side</span>
              </button>
            </div>
          </div>

          {/* Quick tips */}
          <p className="text-[11px] text-[#737373] mt-3 font-mono text-center">
            DRAG GRAPHICS FREELY WITHIN PRINT ZONE • USE CONTROLS ON RIGHT TO ROTATE & SCALE
          </p>
        </div>

        {/* Right: Controls Panel (col 5) */}
        <div className="lg:col-span-5 bg-white border border-[#E5E5E5] p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-6">
            {/* Control Tabs */}
            <div className="flex border-b border-[#E5E5E5]">
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'text' ? 'border-b-2 border-black text-black' : 'text-[#737373] hover:text-black'
                }`}
              >
                <Type size={14} />
                <span>Text Tools</span>
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'image' ? 'border-b-2 border-black text-black' : 'text-[#737373] hover:text-black'
                }`}
              >
                <Upload size={14} />
                <span>Graphic Upload</span>
              </button>
              <button
                onClick={() => setActiveTab('garment')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'garment' ? 'border-b-2 border-black text-black' : 'text-[#737373] hover:text-black'
                }`}
              >
                <span>Garment</span>
              </button>
            </div>

            {/* TAB 1: TEXT TOOLS */}
            {activeTab === 'text' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-black">Typography</span>
                  <button
                    onClick={handleAddText}
                    className="text-xs font-bold uppercase tracking-wider text-black underline hover:opacity-75"
                  >
                    + Add New Line
                  </button>
                </div>

                {selectedElement && selectedElement.type === 'text' ? (
                  <div className="space-y-4">
                    {/* Input */}
                    <div>
                      <label className="text-[10px] uppercase font-mono text-[#737373] block mb-1.5">
                        Text Content
                      </label>
                      <input
                        type="text"
                        value={selectedElement.content}
                        onChange={(e) => updateSelected('content', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E5E5] text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-black"
                        placeholder="ENTER TEXT"
                      />
                    </div>

                    {/* Font Selector */}
                    <div>
                      <label className="text-[10px] uppercase font-mono text-[#737373] block mb-1.5">
                        Font Family
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {FONTS.map((f) => (
                          <button
                            key={f.name}
                            onClick={() => updateSelected('fontFamily', f.name)}
                            className={`p-2 text-xs border text-left transition-colors uppercase ${
                              selectedElement.fontFamily === f.name
                                ? 'border-black bg-black text-white font-bold'
                                : 'border-[#E5E5E5] text-black hover:border-black'
                            }`}
                          >
                            <span className={f.className}>{f.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Size Slider */}
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-[#737373] uppercase mb-1">
                        <span>Font Size</span>
                        <span>{selectedElement.fontSize}PX</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="48"
                        value={selectedElement.fontSize}
                        onChange={(e) => updateSelected('fontSize', parseInt(e.target.value, 10))}
                        className="w-full accent-black"
                      />
                    </div>

                    {/* Rotation Slider */}
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-[#737373] uppercase mb-1">
                        <span>Rotation</span>
                        <span>{selectedElement.rotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={selectedElement.rotation}
                        onChange={(e) => updateSelected('rotation', parseInt(e.target.value, 10))}
                        className="w-full accent-black"
                      />
                    </div>

                    {/* Color Swatches */}
                    <div>
                      <label className="text-[10px] uppercase font-mono text-[#737373] block mb-1.5">
                        Text Color (Monochrome)
                      </label>
                      <div className="flex items-center gap-2">
                        {TEXT_COLORS.map((c) => (
                          <button
                            key={c.hex}
                            onClick={() => updateSelected('textColor', c.hex)}
                            className={`w-7 h-7 rounded-full border flex items-center justify-center transition-transform ${
                              selectedElement.textColor === c.hex ? 'scale-110 border-black' : 'border-[#D4D4D4]'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          >
                            {selectedElement.textColor === c.hex && (
                              <Check
                                size={12}
                                className={c.hex === '#FFFFFF' ? 'text-black' : 'text-white'}
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Delete text button */}
                    <button
                      onClick={() => handleRemoveElement(selectedElement.id)}
                      className="text-xs text-[#737373] hover:text-black flex items-center gap-1.5 pt-2 uppercase font-medium"
                    >
                      <Trash2 size={14} /> Remove Text Element
                    </button>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-[#737373] border border-dashed border-[#E5E5E5]">
                    Click on a text element on the shirt canvas or click &quot;+ Add New Line&quot; above.
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: IMAGE TOOLS */}
            {activeTab === 'image' && (
              <div className="space-y-5">
                <span className="text-xs font-bold uppercase tracking-wider text-black block">
                  Custom Artwork / Graphics
                </span>

                {/* Upload Input */}
                <label className="flex flex-col items-center justify-center p-6 border border-dashed border-black bg-[#F5F5F5] hover:bg-[#E5E5E5] cursor-pointer transition-colors text-center">
                  <Upload size={22} className="text-black mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider text-black">
                    Upload Graphic Image
                  </span>
                  <span className="text-[10px] text-[#737373] font-mono mt-1">
                    PNG, JPG, WEBP (TRANSPARENT PNG RECOMMENDED)
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {selectedElement && selectedElement.type === 'image' ? (
                  <div className="space-y-4 pt-2 border-t border-[#E5E5E5]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-black">Selected Graphic</span>
                      <button
                        onClick={() => handleRemoveElement(selectedElement.id)}
                        className="text-xs text-[#737373] hover:text-black flex items-center gap-1 uppercase"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>

                    {/* Scale */}
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-[#737373] uppercase mb-1">
                        <span>Scale / Size</span>
                        <span>{Math.round(selectedElement.scale * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.05"
                        value={selectedElement.scale}
                        onChange={(e) => updateSelected('scale', parseFloat(e.target.value))}
                        className="w-full accent-black"
                      />
                    </div>

                    {/* Rotation */}
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-[#737373] uppercase mb-1">
                        <span>Rotation</span>
                        <span>{selectedElement.rotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={selectedElement.rotation}
                        onChange={(e) => updateSelected('rotation', parseInt(e.target.value, 10))}
                        className="w-full accent-black"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#737373] text-center py-4">
                    Upload a graphic to position, scale, and print on your garment.
                  </p>
                )}
              </div>
            )}

            {/* TAB 3: GARMENT OPTIONS */}
            {activeTab === 'garment' && (
              <div className="space-y-5">
                {/* Color */}
                <div>
                  <label className="text-[10px] uppercase font-mono text-[#737373] block mb-2">
                    Garment Color: <strong className="text-black font-sans">{garmentColor.name}</strong>
                  </label>
                  <div className="flex items-center gap-3">
                    {GARMENT_COLORS.map((col) => (
                      <button
                        key={col.name}
                        onClick={() => setGarmentColor(col)}
                        className={`w-9 h-9 border flex items-center justify-center transition-all ${
                          garmentColor.name === col.name
                            ? 'ring-2 ring-black ring-offset-2 border-black scale-105'
                            : 'border-[#D4D4D4] hover:scale-105'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {garmentColor.name === col.name && (
                          <Check
                            size={14}
                            className={col.hex === '#FFFFFF' ? 'text-black' : 'text-white'}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizing */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] uppercase font-mono text-[#737373]">
                      Garment Size: <strong className="text-black font-sans">{garmentSize}</strong>
                    </label>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {SIZES.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setGarmentSize(sz)}
                        className={`py-2 text-xs font-mono font-bold uppercase border transition-colors ${
                          garmentSize === sz
                            ? 'bg-black text-white border-black'
                            : 'border-[#E5E5E5] text-black hover:border-black'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specifications */}
                <div className="p-3 bg-[#F5F5F5] border border-[#E5E5E5] text-[11px] font-mono space-y-1 text-[#404040]">
                  <div>MATERIAL: 280 GSM HEAVYWEIGHT COMBED COTTON</div>
                  <div>PRINT TECH: ARCHIVAL DIRECT-TO-GARMENT</div>
                  <div>FIT: OVERSIZED DROPPED SHOULDER</div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Add to Bag CTA */}
          <div className="pt-6 border-t border-[#E5E5E5] mt-6 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#737373] uppercase block">
                  CUSTOM STUDIO TOTAL
                </span>
                <span className="text-lg font-bold font-mono text-black">
                  ₹{(product?.discountPrice || product?.base_price || 2490).toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#737373] uppercase">
                MADE TO ORDER // 3-4 DAYS
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={saving}
              className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#262626] transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <ShoppingBag size={14} />
              <span>{saving ? 'Preparing Custom Piece...' : 'Add Custom Piece to Bag'}</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Simulation Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 border border-black shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#E5E5E5]">
              <div>
                <span className="text-[10px] font-mono text-[#737373] uppercase">PREVIEW ARCHIVAL PROOF</span>
                <h3 className="text-sm font-bold uppercase text-black">
                  {product?.name} ({garmentColor.name} // Size {garmentSize})
                </h3>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="text-xs uppercase font-mono underline hover:opacity-75"
              >
                Close
              </button>
            </div>

            <div className="w-full aspect-square bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center p-6 relative overflow-hidden">
              <div className="w-4/5 h-4/5 relative flex items-center justify-center">
                <TShirtMockup color={garmentColor.hex} isBack={activeSide === 'back'} />
                {/* Print area */}
                <div className="absolute w-[180px] h-[220px] top-[95px] overflow-hidden pointer-events-none">
                  {activeElements.map((el) => {
                    if (el.type === 'text') {
                      return (
                        <div
                          key={el.id}
                          className="absolute"
                          style={{
                            left: `${(el.x * 180) / 240}px`,
                            top: `${(el.y * 220) / 300}px`,
                            transform: `rotate(${el.rotation}deg) scale(${el.scale * 0.75})`,
                          }}
                        >
                          <span
                            className="font-bold uppercase tracking-wide block whitespace-nowrap"
                            style={{
                              fontSize: `${el.fontSize}px`,
                              color: el.textColor,
                            }}
                          >
                            {el.content}
                          </span>
                        </div>
                      );
                    }
                    if (el.type === 'image') {
                      return (
                        <div
                          key={el.id}
                          className="absolute"
                          style={{
                            left: `${(el.x * 180) / 240}px`,
                            top: `${(el.y * 220) / 300}px`,
                            width: `${el.width * el.scale * 0.75}px`,
                            transform: `rotate(${el.rotation}deg)`,
                          }}
                        >
                          <img src={el.url} alt="" className="w-full h-auto object-contain" />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPreviewModalOpen(false);
                  handleAddToCart();
                }}
                className="flex-1 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#262626] transition-colors"
              >
                Approve & Add to Bag
              </button>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-6 py-3 border border-[#E5E5E5] text-black text-xs font-semibold uppercase tracking-wider hover:bg-[#F5F5F5]"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizerStudioPage;
