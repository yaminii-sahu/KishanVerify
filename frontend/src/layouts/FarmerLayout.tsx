import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Layers, 
  Landmark, 
  Coins, 
  ShieldCheck, 
  Bot, 
  HelpCircle, 
  FileText, 
  User, 
  Bell, 
  Globe, 
  ArrowRightLeft,
  Sparkles
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { TractorSilhouette } from '../components/TractorSilhouette';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const FarmerLayout: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { farmer, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);

  const navItems = [
    { path: '/farmer', labelKey: 'nav.home', icon: Home },
    { path: '/farmer/schemes', labelKey: 'nav.schemes', icon: Layers },
    { path: '/farmer/loan-verify', labelKey: 'nav.loan', icon: Landmark },
    { path: '/farmer/msp-verify', labelKey: 'nav.msp', icon: Coins },
    { path: '/farmer/insurance-verify', labelKey: 'nav.insurance', icon: ShieldCheck },
    { path: '/farmer/assistant', labelKey: 'nav.assistant', icon: Bot, highlight: true },
    { path: '/farmer/grievance', labelKey: 'nav.grievances', icon: HelpCircle },
    { path: '/farmer/reports', labelKey: 'nav.reports', icon: FileText },
    { path: '/farmer/profile', labelKey: 'nav.profile', icon: User },
  ];

  const mobileBottomTabs = [
    { path: '/farmer', labelKey: 'nav.home', icon: Home },
    { path: '/farmer/schemes', labelKey: 'nav.schemes', icon: Layers },
    { path: '/farmer/assistant', labelKey: 'nav.assistant', icon: Bot, isSpecial: true },
    { path: '/farmer/reports', labelKey: 'nav.reports', icon: FileText },
    { path: '/farmer/profile', labelKey: 'nav.profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-warm-bg flex flex-col md:flex-row antialiased text-gray-900 selection:bg-sage-200">
      
      {/* ============================================================== */}
      {/* DESKTOP SIDEBAR (Dark green styled from mockups)               */}
      {/* ============================================================== */}
      <aside className="hidden md:flex w-72 bg-sidebar text-white flex-col justify-between shrink-0 shadow-xl relative z-20">
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="p-6 border-b border-white/10">
            <Logo variant="white" showTagline={true} size="md" />
          </div>

          {/* Nav items */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-sage-600 text-white font-semibold shadow-md'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-sage-300'}`} />
                  <span className="truncate">{t(item.labelKey)}</span>
                  {item.highlight && (
                    <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sage-500 text-white">
                      AI
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Tractor Silhouette */}
        <div className="mt-auto relative overflow-hidden pt-4">
          <div className="px-6 py-3 border-t border-white/10 text-[11px] text-white/60 flex items-center justify-between">
            <span>KisanVerify v1.0</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white/80 font-mono text-[10px]">
              Demo
            </span>
          </div>
          <TractorSilhouette className="w-full h-16 opacity-75" />
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MAIN CONTENT AREA                                              */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-warm-bg/90 backdrop-blur-md border-b border-warm-border px-4 sm:px-8 py-3.5 flex items-center justify-between">
          
          {/* Mobile brand header */}
          <div className="flex items-center gap-3 md:hidden">
            <Logo variant="dark" showTagline={false} size="sm" />
          </div>

          {/* Desktop Greeting */}
          <div className="hidden md:flex flex-col">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>{language === 'hi' ? 'नमस्ते, ' + farmer.nameHi : 'Namaste, ' + farmer.name}</span>
              <span className="text-xl">👋</span>
            </h1>
            <p className="text-xs text-gray-500">
              {t('home.summary_sub')}
            </p>
          </div>

          {/* Action pills & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-white border border-warm-border text-gray-700 hover:bg-sage-50 hover:border-sage-300 transition-colors shadow-soft"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-sage-600" />
              <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            {/* Quick Role Switcher for Hackathon Judges */}
            <button
              onClick={() => {
                switchRole('admin');
                navigate('/admin');
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full bg-sage-100 text-sage-800 border border-sage-200 hover:bg-sage-200 transition-colors"
              title="Switch to Bank / Admin Dashboard View"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-sage-600" />
              <span className="hidden sm:inline">Bank Admin View</span>
              <span className="sm:hidden">Admin</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="w-9 h-9 rounded-full bg-white border border-warm-border flex items-center justify-center text-gray-700 hover:bg-sage-50 transition-colors shadow-soft relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-kisan-red"></span>
              </button>

              {/* Notification Popover */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-warm-border p-4 z-50 text-xs">
                  <div className="flex items-center justify-between font-bold text-gray-900 border-b pb-2 mb-2">
                    <span>Notifications</span>
                    <span className="text-[10px] text-sage-600">2 New</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-2.5 rounded-xl bg-kisan-lightred/60 border border-kisan-red/20">
                      <p className="font-semibold text-kisan-red">Loan Discrepancy Flagged</p>
                      <p className="text-gray-600 text-[11px] mt-0.5">Approved ₹80,000 vs Disbursed ₹70,000 difference needs review.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-kisan-lightamber/60 border border-kisan-amber/20">
                      <p className="font-semibold text-kisan-amber">MSP Payment Status</p>
                      <p className="text-gray-600 text-[11px] mt-0.5">Paddy procurement ₹10,000 difference recorded for Patan mandi.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Farmer Avatar & ID badge */}
            <NavLink
              to="/farmer/profile"
              className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white rounded-full border border-warm-border shadow-soft hover:border-sage-400 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center font-bold text-xs">
                RK
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-gray-900 leading-none">
                  {farmer.name}
                </span>
                <span className="text-[10px] font-mono text-gray-500 leading-none mt-0.5">
                  ID: {farmer.farmerId}
                </span>
              </div>
            </NavLink>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* ============================================================== */}
      {/* MOBILE BOTTOM TAB BAR (Matching screenshot exactly)            */}
      {/* ============================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-warm-border px-3 py-1.5 flex items-center justify-around shadow-2xl">
        {mobileBottomTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          if (tab.isSpecial) {
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center -mt-5"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                  isActive ? 'bg-sage-700 text-white scale-105' : 'bg-sage-600 text-white'
                }`}>
                  <Bot className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-semibold mt-1 ${isActive ? 'text-sage-700' : 'text-gray-600'}`}>
                  {t(tab.labelKey)}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
                isActive ? 'text-sage-700 font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-1">{t(tab.labelKey)}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
