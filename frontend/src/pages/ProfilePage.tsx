import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Globe, 
  Bell, 
  Info, 
  LogOut, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Landmark, 
  Wheat,
  Edit2,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import farmerAvatarImg from '../assets/illustrations/farmer-avatar.svg';

export const ProfilePage: React.FC = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { farmer, switchRole } = useAuth();
  const navigate = useNavigate();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  return (
    <div className="space-y-6 max-w-md mx-auto">
      
      {/* Profile Card with Sage Wave Header (Image B Screen 10) */}
      <div className="bg-cream-surface rounded-2xl overflow-hidden border border-warm-border shadow-soft text-center relative">
        
        {/* Dark Olive Green Header with Wave Curve */}
        <div className="h-28 bg-forest relative flex items-start justify-center pt-4">
          <h1 className="text-white font-bold text-base tracking-tight">
            Profile
          </h1>
          {/* Decorative wave at bottom of header */}
          <svg 
            className="absolute bottom-0 left-0 right-0 w-full h-6 text-cream-surface" 
            viewBox="0 0 360 24" 
            preserveAspectRatio="none" 
            fill="currentColor"
          >
            <path d="M0 12 C100 24 260 0 360 16 L360 24 L0 24 Z" />
          </svg>
        </div>

        {/* Circular Avatar with Edit Badge (Image B Screen 10) */}
        <div className="relative -mt-12 flex justify-center">
          <div className="relative">
            <img 
              src={farmerAvatarImg} 
              alt={farmer.name} 
              className="w-24 h-24 rounded-full object-cover border-4 border-cream-surface shadow-soft"
            />
            <button 
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-forest border-2 border-cream-surface text-white flex items-center justify-center shadow-soft"
              aria-label="Edit Profile"
              title="Edit Profile"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Farmer Name & ID */}
        <div className="p-5 pt-3 space-y-1">
          <h2 className="text-xl font-bold text-charcoal tracking-tight">
            {language === 'hi' ? farmer.nameHi : farmer.name}
          </h2>
          <p className="text-xs font-mono font-medium text-muted">
            Farmer ID: {farmer.farmerId}
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-tint text-forest text-xs font-semibold">
              {farmer.village}, {farmer.district}
            </span>
            <span className="px-3 py-1 rounded-full bg-tint text-forest text-xs font-semibold">
              {farmer.landAreaAcres} Acres • {farmer.crop}
            </span>
          </div>
        </div>
      </div>

      {/* Menu List Rows (Matching Image B Screen 10) */}
      <div className="bg-cream-surface rounded-2xl border border-warm-border shadow-soft divide-y divide-warm-border overflow-hidden">
        
        {/* 1. My Details */}
        <button
          onClick={() => setShowDetailsModal(true)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-tint/30 transition-colors min-h-[52px]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-tint text-forest flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-charcoal">My Details</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted" />
        </button>

        {/* 2. Language */}
        <button
          onClick={toggleLanguage}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-tint/30 transition-colors min-h-[52px]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-tint text-forest flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-charcoal">Language</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted">
              {language === 'en' ? 'English' : 'हिंदी'}
            </span>
            <ChevronRight className="w-4 h-4 text-muted" />
          </div>
        </button>

        {/* 3. Notifications */}
        <button
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-tint/30 transition-colors min-h-[52px]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-tint text-forest flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-charcoal">Notifications</span>
          </div>
          <span className="text-xs font-semibold text-forest">
            {notificationsEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </button>

        {/* 4. About KisanVerify */}
        <button
          onClick={() => setShowAboutModal(true)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-tint/30 transition-colors min-h-[52px]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-tint text-forest flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-charcoal">About KisanVerify</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted" />
        </button>

        {/* 5. Logout */}
        <button
          onClick={() => navigate('/login')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-status-discrepancy-bg/50 transition-colors min-h-[52px]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-status-discrepancy-bg text-status-discrepancy-text flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-status-discrepancy-text">Logout</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted" />
        </button>
      </div>

      {/* Details Modal (Bottom sheet on phone, dialog on desktop) */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-cream-surface rounded-t-3xl sm:rounded-2xl p-6 border border-warm-border shadow-dropdown space-y-4 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-warm-border pb-3">
              <h3 className="text-base font-bold text-charcoal">Farmer Details</h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="w-8 h-8 rounded-full hover:bg-tint flex items-center justify-center text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-warm-border">
                <span className="text-muted">Aadhaar (Masked):</span>
                <span className="font-mono font-bold text-charcoal">XXXX-XXXX-8921</span>
              </div>
              <div className="flex justify-between py-1 border-b border-warm-border">
                <span className="text-muted">Phone:</span>
                <span className="font-bold text-charcoal">{farmer.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-warm-border">
                <span className="text-muted">Bank Branch:</span>
                <span className="font-bold text-charcoal">State Bank of India (Patan)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-warm-border">
                <span className="text-muted">Land Khasra No:</span>
                <span className="font-bold text-charcoal">142/1, 142/2</span>
              </div>
            </div>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full py-3 rounded-xl bg-forest text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-cream-surface rounded-t-3xl sm:rounded-2xl p-6 border border-warm-border shadow-dropdown space-y-4 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-warm-border pb-3">
              <h3 className="text-base font-bold text-charcoal">About KisanVerify</h3>
              <button 
                onClick={() => setShowAboutModal(false)}
                className="w-8 h-8 rounded-full hover:bg-tint flex items-center justify-center text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-muted leading-relaxed">
              <p>
                <strong>KisanVerify</strong> is an agricultural financial transparency and policy verification platform.
              </p>
              <p>
                <strong>Tagline:</strong> "Every rupee. Every benefit. Verified."
              </p>
              <p>
                All calculations are executed strictly deterministically via verified algorithms.
              </p>
            </div>
            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-3 rounded-xl bg-forest text-white font-bold text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
