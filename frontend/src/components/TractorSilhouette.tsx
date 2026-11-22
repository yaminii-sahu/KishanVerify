import React from 'react';

export const TractorSilhouette: React.FC<{ className?: string }> = ({ className = 'w-full h-24' }) => {
  return (
    <svg
      viewBox="0 0 240 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
    >
      {/* Gentle rolling hill lines */}
      <path
        d="M0 65 Q60 55 120 62 Q180 70 240 58 L240 80 L0 80 Z"
        fill="#1C351E"
        opacity="0.9"
      />
      <path
        d="M0 72 Q80 64 160 70 Q200 73 240 68 L240 80 L0 80 Z"
        fill="#142616"
        opacity="0.95"
      />

      {/* Tractor Silhouette */}
      <g transform="translate(140, 32) scale(0.65)" fill="#2E4F28">
        {/* Cab and Hood */}
        <rect x="25" y="10" width="18" height="18" rx="2" fill="#2E4F28" />
        <rect x="2" y="18" width="28" height="14" rx="2" fill="#2E4F28" />
        <rect x="33" y="2" width="3" height="12" fill="#2E4F28" />
        {/* Driver silhouette */}
        <circle cx="34" cy="15" r="4" fill="#233E25" />
        {/* Big rear wheel */}
        <circle cx="35" cy="32" r="14" fill="#1C351E" stroke="#3A6333" strokeWidth="3" />
        <circle cx="35" cy="32" r="5" fill="#2E4F28" />
        {/* Small front wheel */}
        <circle cx="8" cy="36" r="8" fill="#1C351E" stroke="#3A6333" strokeWidth="2.5" />
        <circle cx="8" cy="36" r="3" fill="#2E4F28" />
      </g>
    </svg>
  );
};
