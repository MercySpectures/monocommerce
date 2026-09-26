import React from 'react';
import { useCart } from '../../context/CartContext';
import { Check } from 'lucide-react';

const Toast = () => {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 transform translate-y-0 opacity-100">
      <div className="bg-[#0A0A0A] text-white px-5 py-3.5 border border-[#262626] shadow-2xl flex items-center gap-3 text-xs tracking-wider uppercase font-medium">
        <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center">
          <Check size={12} strokeWidth={3} />
        </div>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};

export default Toast;
