import React from 'react';

/**
 * Realistic vector architectural T-Shirt garment mockup
 * Supports dynamic fabric colors and front/back seams
 */
const TShirtMockup = ({ color = '#0A0A0A', isBack = false }) => {
  const isDark = color === '#0A0A0A' || color === '#262626';
  const seamColor = isDark ? '#404040' : '#D4D4D4';
  const shadowColor = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.06)';

  return (
    <svg
      viewBox="0 0 500 550"
      className="w-full h-full drop-shadow-md select-none pointer-events-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Garment Body Path */}
      <path
        d="M170 42 C195 56 305 56 330 42 L430 115 L375 205 L335 175 L335 500 L165 500 L165 175 L125 205 L70 115 Z"
        fill={color}
        stroke={seamColor}
        strokeWidth="1.5"
      />

      {/* Fabric Texture Shading */}
      <path
        d="M170 42 C195 56 305 56 330 42 L430 115 L375 205 L335 175 L335 500 L165 500 L165 175 L125 205 L70 115 Z"
        fill={shadowColor}
      />

      {/* Collar */}
      {!isBack ? (
        // Front Collar scoop
        <path
          d="M170 42 C205 92 295 92 330 42 C300 78 200 78 170 42 Z"
          fill={isDark ? '#171717' : '#E5E5E5'}
          stroke={seamColor}
          strokeWidth="1.5"
        />
      ) : (
        // Back Collar straight/shallow
        <path
          d="M170 42 C210 58 290 58 330 42 C295 50 205 50 170 42 Z"
          fill={isDark ? '#171717' : '#E5E5E5'}
          stroke={seamColor}
          strokeWidth="1.5"
        />
      )}

      {/* Shoulder / Sleeve Seams */}
      <path d="M170 42 L165 175" stroke={seamColor} strokeWidth="1" strokeDasharray="2 2" />
      <path d="M330 42 L335 175" stroke={seamColor} strokeWidth="1" strokeDasharray="2 2" />

      {/* Sleeve Hem lines */}
      <path d="M70 115 L125 205" stroke={seamColor} strokeWidth="1.5" />
      <path d="M430 115 L375 205" stroke={seamColor} strokeWidth="1.5" />

      {/* Bottom Hem */}
      <path d="M165 488 L335 488" stroke={seamColor} strokeWidth="1" strokeDasharray="3 3" />
      <path d="M165 500 L335 500" stroke={seamColor} strokeWidth="1.5" />

      {/* Woven Studio Label (inner collar if front, or outer back tag) */}
      {!isBack ? (
        <rect x="235" y="66" width="30" height="14" fill="#000000" stroke="#404040" strokeWidth="0.75" />
      ) : (
        <rect x="238" y="70" width="24" height="6" fill="#404040" />
      )}
    </svg>
  );
};

export default TShirtMockup;
