import React from 'react';
import logoTile from '../assets/brand/logo-tile.png';
import logoMark from '../assets/brand/logo-mark.png';
import logoMonoWhite from '../assets/brand/logo-mono-white.png';

export interface LogoProps {
  variant?: 'mark' | 'mark-with-text' | 'tile' | 'mono-white' | 'dark' | 'white' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showText?: boolean;
  stacked?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  showTagline = true,
  showText = true,
  stacked = false,
  className = '',
}) => {
  const isWhite = variant === 'white' || variant === 'mono-white';
  const isTileOnly = variant === 'tile' && !showText;
  const isMarkOnly = variant === 'mark';

  // Choose the appropriate asset
  let logoSrc = logoTile;
  if (variant === 'mono-white') {
    logoSrc = logoMonoWhite;
  } else if (variant === 'mark') {
    logoSrc = logoMark;
  } else if (variant === 'white') {
    // For white backgrounds on dark forest, logoMonoWhite or logoTile can be used
    logoSrc = logoMonoWhite;
  } else {
    logoSrc = logoTile;
  }

  // Responsive dimensions
  const dimensions = {
    sm: {
      img: 'w-8 h-8 min-w-[32px] min-h-[32px]',
      title: 'text-lg',
      tagline: 'text-[10px]',
    },
    md: {
      img: 'w-11 h-11 min-w-[44px] min-h-[44px]',
      title: 'text-2xl',
      tagline: 'text-xs',
    },
    lg: {
      img: 'w-16 h-16 min-w-[64px] min-h-[64px]',
      title: 'text-3xl',
      tagline: 'text-xs sm:text-sm',
    },
    xl: {
      img: 'w-24 h-24 min-w-[96px] min-h-[96px]',
      title: 'text-4xl',
      tagline: 'text-sm sm:text-base',
    },
  };

  const dim = dimensions[size] || dimensions.md;

  if (isMarkOnly || isTileOnly) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src={logoSrc}
          alt="KisanVerify logo"
          className={`${dim.img} object-contain transition-transform`}
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex ${
        stacked ? 'flex-col items-center text-center' : 'items-center gap-3'
      } ${className}`}
    >
      {/* Official Brand Logo Icon / Tile */}
      <div className={`${dim.img} shrink-0 flex items-center justify-center relative`}>
        <img
          src={logoSrc}
          alt="KisanVerify logo"
          className="w-full h-full object-contain filter drop-shadow-sm"
          loading="eager"
        />
      </div>

      {/* Brand Name & Tagline */}
      {showText && (
        <div className={`flex flex-col ${stacked ? 'items-center mt-2' : ''}`}>
          <span
            className={`font-black tracking-tight leading-none ${dim.title} ${
              isWhite ? 'text-white' : 'text-charcoal'
            }`}
          >
            Kisan<span className={isWhite ? 'text-tint' : 'text-forest'}>Verify</span>
          </span>
          {showTagline && (
            <span
              className={`font-semibold tracking-tight mt-1 ${dim.tagline} ${
                isWhite ? 'text-white/80' : 'text-charcoal-muted'
              }`}
            >
              Every Rupee. Every Benefit. Verified.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
