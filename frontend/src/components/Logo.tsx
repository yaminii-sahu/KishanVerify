import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'white';
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  showTagline = true,
  size = 'md',
}) => {
  const isLight = variant === 'light';
  const isWhite = variant === 'white';

  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-3">
      {/* Emblem: Circular leaf icon */}
      <div
        className={`${iconSizes[size]} rounded-2xl flex items-center justify-center shrink-0 ${
          isLight || isWhite
            ? 'bg-sage-100 text-sage-800 border border-sage-200'
            : 'bg-sage-600 text-white shadow-soft'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5/6 h-5/6"
        >
          <path d="M11 20A7 7 0 0 1 4 13C4 7 11 3 20 3c0 9-4 16-9 17Z" />
          <path d="M11 20c0-6 4-10 9-11" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-bold tracking-tight leading-none ${titleSizes[size]} ${
            isWhite ? 'text-white' : isLight ? 'text-gray-900' : 'text-gray-900'
          }`}
        >
          Kisan<span className={isWhite ? 'text-sage-300' : 'text-sage-600'}>Verify</span>
        </span>
        {showTagline && (
          <span
            className={`text-[10px] sm:text-xs font-medium tracking-tight mt-1 ${
              isWhite ? 'text-white/70' : 'text-gray-500'
            }`}
          >
            Every rupee. Every benefit. Verified.
          </span>
        )}
      </div>
    </div>
  );
};
