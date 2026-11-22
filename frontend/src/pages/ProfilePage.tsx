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
  Edit2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';

export const ProfilePage: React.FC = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { farmer, switchRole } = useAuth();
  const navigate = useNavigate();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  return (
    <div className="space-y-6 max-w-md mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/farmer')}
          className="w-10 h-10 rounded-2xl bg-white border border-warm-border flex items-center justify-center text-gray-700 hover:bg-sage-50 transition-colors shadow-soft"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          {language === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}
        </h1>
      </div>

      {/* Hero Profile Card with Farmer Avatar (Matching Screen 10 mockup) */}
      <div className="bg-white rounded-3xl overflow-hidden border border-warm-border shadow-card text-center relative">
        
        {/* Sage green header banner */}
        <div className="h-24 bg-gradient-to-r from-sage-700 via-sidebar to-sage-800 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FAF8F2_1px,transparent_1px)] [background-size:12px_12px]" />
        </div>

        {/* Circular Avatar */}
        <div className="relative -mt-12 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-white p-1 shadow-card border-2 border-sage-200">
            <div className="w-full h-full rounded-full bg-sage-100 flex items-center justify-center text-sage-800 font-extrabold text-2xl relative">
              RK
              <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-sage-600 border-2 border-white flex items-center justify-center text-white text-xs">
                ✓
              </span>
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="p-5 pt-3 space-y-1">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {language === 'hi' ? farmer.nameHi : farmer.name}
          </h2>
          <p className="text-xs font-mono font-medium text-gray-500">
            Farmer ID: {farmer.farmerId}
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sage-50 text-sage-800 border border-sage-200 text-[11px] font-semibold">
              {farmer.village}, {farmer.district}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-sage-50 text-sage-800 border border-sage-200 text-[11px] font-semibold">
              {farmer.landAreaAcres} Acres • {farmer.crop}
            </span>
          </div>
        </div>
      </div>

      {/* Menu List (Matching Screen 10 mockup items) */}
      <div className="bg-white rounded-3xl border border-warm-border shadow-card divide-y divide-warm-border/60 overflow-hidden">
        
        {/* My Details */}
        <button
          onClick={() => setShowDetailsModal(true)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-warm-bg transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">My Details</p>
              <p className="text-[11px] text-gray-400">Land holding, bank and Aadhaar status</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Language Switch */}
        <button
          onClick={toggleLanguage}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-warm-bg transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Language</p>
              <p className="text-[11px] text-gray-400">
                Current: <strong className="text-sage-800">{language === 'en' ? 'English' : 'हिंदी'}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-sage-700 px-2 py-0.5 rounded-lg bg-sage-50 border border-sage-200">
              {language === 'en' ? 'हिंदी में बदलें' : 'Switch to EN'}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </button>

        {/* Notifications */}
        <div className="p-4 flex items-center justify-between text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Notifications</p>
              <p className="text-[11px] text-gray-400">SMS & verification alerts</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={() => setNotificationsEnabled(!notificationsEnabled)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage-600" />
          </label>
        </div>

        {/* About KisanVerify */}
        <button
          onClick={() => setShowAboutModal(true)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-warm-bg transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">About KisanVerify</p>
              <p className="text-[11px] text-gray-400">Version, mission & transparency principles</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Sign Out */}
        <button
          onClick={() => navigate('/login')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-red-50 text-kisan-red transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-kisan-red flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <p className="text-sm font-semibold">Logout</p>
          </div>
          <ChevronRight className="w-4 h-4 text-kisan-red/60" />
        </button>

      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-warm-border space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Beneficiary Details</h3>
            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="p-3 bg-warm-bg rounded-xl flex justify-between">
                <span>Name:</span>
                <strong className="text-gray-900">{farmer.name}</strong>
              </div>
              <div className="p-3 bg-warm-bg rounded-xl flex justify-between">
                <span>Phone:</span>
                <strong className="text-gray-900">{farmer.phone}</strong>
              </div>
              <div className="p-3 bg-warm-bg rounded-xl flex justify-between">
                <span>Village & District:</span>
                <strong className="text-gray-900">{farmer.village}, {farmer.district}</strong>
              </div>
              <div className="p-3 bg-warm-bg rounded-xl flex justify-between">
                <span>Land Holding:</span>
                <strong className="text-gray-900">{farmer.landAreaAcres} Acres ({farmer.category})</strong>
              </div>
              <div className="p-3 bg-warm-bg rounded-xl flex justify-between">
                <span>Bank Account:</span>
                <strong className="text-gray-900">{farmer.bankName} ({farmer.accountNumberMasked})</strong>
              </div>
            </div>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full py-2.5 rounded-2xl bg-sage-600 text-white font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-warm-border space-y-4 text-center">
            <Logo variant="dark" size="md" showTagline={true} />
            <p className="text-xs text-gray-600 leading-relaxed text-left pt-2">
              KisanVerify is an agricultural financial transparency platform ensuring that every rupee sanctioned, disbursed, or claimed is verified deterministically against government and institutional policies.
            </p>
            <div className="p-3 rounded-2xl bg-sage-50 text-[11px] text-sage-900 font-medium text-left">
              • Deterministic Python calculations<br/>
              • Neutral non-accusatory wording<br/>
              • Multilingual voice assistance (Hindi & English)<br/>
              • Bank & Administrative reconciliation
            </div>
            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2.5 rounded-2xl bg-sage-600 text-white font-semibold text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
