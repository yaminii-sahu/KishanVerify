import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, ArrowRight } from 'lucide-react';
import farmerFieldsImg from '../assets/illustrations/farmer-fields.svg';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole } = useAuth();

  return (
    <div className="min-h-[100dvh] bg-cream flex flex-col justify-between items-center px-4 py-8 max-w-md mx-auto text-center">
      {/* Top Centered Logo & Tagline */}
      <div className="pt-4 flex flex-col items-center">
        <Logo variant="tile" size="xl" showTagline={true} stacked={true} />
      </div>

      {/* Hero Farmer in Fields Artwork */}
      <div className="my-4 w-full max-w-sm rounded-2xl overflow-hidden shadow-soft border border-warm-border bg-cream-surface p-2">
        <div className="w-full h-60 sm:h-64 rounded-xl overflow-hidden">
          <img 
            src={farmerFieldsImg} 
            alt="Farmer in fields holding phone" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-3 pb-4">
        {/* Farmer Login */}
        <button
          onClick={() => {
            switchRole('farmer');
            navigate('/farmer');
          }}
          className="w-full h-[52px] py-3.5 px-6 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-base shadow-soft flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
        >
          <User className="w-5 h-5 text-tint" />
          <span>Demo: Farmer Login</span>
        </button>

        {/* Bank / Admin Login */}
        <button
          onClick={() => {
            switchRole('admin');
            navigate('/admin');
          }}
          className="w-full h-[52px] py-3.5 px-6 rounded-xl bg-cream-surface hover:bg-tint text-charcoal font-bold text-base border border-warm-border shadow-soft flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
        >
          <ShieldCheck className="w-5 h-5 text-forest" />
          <span>Bank / Admin Login</span>
        </button>

        {/* 4-Step Interactive Tour Link */}
        <div className="pt-2 flex items-center justify-center gap-3 text-xs text-charcoal-muted">
          <button
            onClick={() => navigate('/onboarding')}
            className="hover:text-forest font-semibold inline-flex items-center gap-1"
          >
            <span>How it works (4-step tour)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
