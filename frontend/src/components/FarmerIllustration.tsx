import React from 'react';

export const FarmerIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E2EFE0" />
          <stop offset="100%" stopColor="#FAF8F2" />
        </linearGradient>
        <linearGradient id="hillFar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A8C99D" />
          <stop offset="100%" stopColor="#87AF79" />
        </linearGradient>
        <linearGradient id="hillNear" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6C975B" />
          <stop offset="100%" stopColor="#4D773E" />
        </linearGradient>
        <linearGradient id="field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A7539" />
          <stop offset="100%" stopColor="#2E5022" />
        </linearGradient>
        <linearGradient id="turbanGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E7DC" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="400" height="300" fill="url(#skyGrad)" rx="24" />

      {/* Distant Hills & Trees */}
      <path
        d="M-20 180 Q60 140 160 165 Q260 190 420 150 L420 300 L-20 300 Z"
        fill="url(#hillFar)"
        opacity="0.8"
      />
      <circle cx="80" cy="155" r="18" fill="#7FA972" />
      <circle cx="105" cy="158" r="14" fill="#6E9761" />
      <circle cx="280" cy="165" r="22" fill="#7FA972" />
      <circle cx="310" cy="170" r="16" fill="#6E9761" />

      {/* Midground Hills */}
      <path
        d="M-10 205 Q90 175 200 195 Q310 215 420 180 L420 300 L-10 300 Z"
        fill="url(#hillNear)"
      />

      {/* Mini Tractor in distance */}
      <g transform="translate(300, 175) scale(0.6)" opacity="0.85">
        <rect x="25" y="15" width="20" height="15" fill="#385A2A" rx="2" />
        <rect x="15" y="22" width="35" height="12" fill="#2E4D21" rx="2" />
        <circle cx="18" cy="35" r="9" fill="#1C3015" stroke="#E5E7EB" strokeWidth="2" />
        <circle cx="45" cy="35" r="6" fill="#1C3015" stroke="#E5E7EB" strokeWidth="1.5" />
        <path d="M25 15 L25 5" stroke="#1C3015" strokeWidth="2" />
      </g>

      {/* Crop rows foreground */}
      <path
        d="M-10 230 Q120 210 250 235 Q350 250 420 225 L420 300 L-10 300 Z"
        fill="url(#field)"
      />

      {/* Farmer Character */}
      <g transform="translate(50, 45)">
        {/* Torso & Kurta */}
        <path
          d="M70 170 C40 185 20 210 10 255 L170 255 C160 210 140 185 110 170 Z"
          fill="#FAF8F2"
        />
        {/* Green Scarf/Gamchha */}
        <path
          d="M48 185 C40 205 35 240 38 255 L65 255 C60 235 62 205 70 185 Z"
          fill="#4E6E3D"
        />
        <path
          d="M110 185 C118 205 125 240 122 255 L95 255 C100 235 98 205 90 185 Z"
          fill="#4E6E3D"
        />

        {/* Neck */}
        <rect x="75" y="140" width="30" height="35" rx="8" fill="#D49A6A" />

        {/* Face */}
        <ellipse cx="90" cy="115" rx="26" ry="32" fill="#D49A6A" />

        {/* Ears */}
        <circle cx="64" cy="115" r="7" fill="#C28758" />
        <circle cx="116" cy="115" r="7" fill="#C28758" />

        {/* Eyes & Eyebrows */}
        <path d="M74 103 Q81 100 87 103" stroke="#2D1F16" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M93 103 Q99 100 106 103" stroke="#2D1F16" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="81" cy="109" r="3" fill="#2D1F16" />
        <circle cx="99" cy="109" r="3" fill="#2D1F16" />

        {/* Nose & Smile */}
        <path d="M89 111 Q91 122 86 123" stroke="#9E683E" strokeWidth="2" strokeLinecap="round" />
        <path d="M79 128 Q90 137 101 128" stroke="#5C3419" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Moustache */}
        <path
          d="M74 125 C82 124 88 126 90 128 C92 126 98 124 106 125 C103 130 96 133 90 130 C84 133 77 130 74 125 Z"
          fill="#3B2618"
        />

        {/* Turban (Pagri) */}
        <path
          d="M58 95 C55 65 80 50 92 50 C110 50 128 65 124 95 C124 105 118 108 90 105 C62 108 58 105 58 95 Z"
          fill="url(#turbanGrad)"
        />
        <path
          d="M60 88 C75 80 105 78 122 88"
          stroke="#C5CCC0"
          strokeWidth="3.5"
          fill="none"
        />
        <path
          d="M65 72 C80 66 100 66 117 72"
          stroke="#C5CCC0"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M85 50 C95 40 105 45 110 52"
          stroke="#D8DFD2"
          strokeWidth="4"
          fill="none"
        />

        {/* Arm holding smartphone */}
        <path
          d="M130 220 Q145 180 148 160"
          stroke="#FAF8F2"
          strokeWidth="24"
          strokeLinecap="round"
        />
        {/* Hand */}
        <circle cx="150" cy="155" r="12" fill="#D49A6A" />

        {/* Smartphone */}
        <rect
          x="142"
          y="125"
          width="24"
          height="45"
          rx="5"
          fill="#1F2937"
          transform="rotate(-15 154 147)"
          stroke="#698E59"
          strokeWidth="1.5"
        />
        <rect
          x="145"
          y="130"
          width="18"
          height="35"
          rx="2"
          fill="#4E6E3D"
          transform="rotate(-15 154 147)"
        />
        {/* Screen checkmark */}
        <path
          d="M149 148 L152 151 L159 144"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="rotate(-15 154 147)"
        />
      </g>
    </svg>
  );
};
