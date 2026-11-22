import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { FarmerIllustration } from '../components/FarmerIllustration';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole } = useAuth();

  return (
    <div className="min-h-screen bg-warm-bg flex flex-col justify-between items-center px-4 py-8 max-w-md mx-auto text-center selection:bg-sage-200">
      {/* Top Logo */}
      <div className="pt-6">
        <Logo variant="dark" size="lg" showTagline={true} />
      </div>

      {/* Hero Illustration */}
      <div className="my-6 w-full max-w-sm rounded-3xl overflow-hidden shadow-card border border-warm-border bg-white p-2">
        <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden">
          <FarmerIllustration className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-3.5 pb-4">
        {/* Farmer Login */}
        <button
          onClick={() => {
            switchRole('farmer');
            navigate('/farmer');
          }}
          className="w-full h-13 py-3.5 px-6 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-base shadow-card flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.98]"
        >
          <User className="w-5 h-5" />
          <span>Farmer Login</span>
        </button>

        {/* Bank / Admin Login */}
        <button
          onClick={() => {
            switchRole('admin');
            navigate('/admin');
          }}
          className="w-full h-13 py-3.5 px-6 rounded-2xl bg-white hover:bg-sage-50 text-gray-800 font-semibold text-base border border-warm-border shadow-soft flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
        >
          <ShieldCheck className="w-5 h-5 text-sage-600" />
          <span>Bank / Admin Login</span>
        </button>

        {/* 1-Click Interactive Tour / Onboarding */}
        <div className="pt-2 flex items-center justify-center gap-4 text-xs text-gray-500">
          <button
            onClick={() => navigate('/onboarding')}
            className="hover:text-sage-700 font-medium inline-flex items-center gap-1"
          >
            <span>How it works (4-step tour)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <span>•</span>
          <button
            onClick={() => {
              switchRole('farmer');
              navigate('/farmer');
            }}
            className="hover:text-sage-700 font-medium text-sage-700 underline"
          >
            Continue as Guest ➔
          </button>
        </div>
      </div>
    </div>
  );
};
