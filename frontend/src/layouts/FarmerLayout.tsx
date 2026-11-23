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
  ArrowLeft,
  Menu,
  X,
  FolderLock,
  TrendingUp,
  CloudSun,
  MapPin,
  PhoneCall
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import tractorFieldImg from '../assets/illustrations/tractor-field.svg';
import farmerAvatarImg from '../assets/illustrations/farmer-avatar.svg';

export const FarmerLayout: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { farmer } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop & Tablet Sidebar items (Image A)
  const navItems = [
    { path: '/farmer', labelKey: 'nav.home', icon: Home },
    { path: '/farmer/schemes', labelKey: 'nav.schemes', icon: Layers },
    { path: '/farmer/loan-verify', labelKey: 'nav.loan', icon: Landmark },
    { path: '/farmer/msp-verify', labelKey: 'nav.msp', icon: Coins },
    { path: '/farmer/mandi', labelKey: 'nav.mandi', icon: TrendingUp },
    { path: '/farmer/weather', labelKey: 'nav.weather', icon: CloudSun },
    { path: '/farmer/offices', labelKey: 'nav.offices', icon: MapPin },
    { path: '/farmer/contact', labelKey: 'nav.contact', icon: PhoneCall },
    { path: '/farmer/insurance-verify', labelKey: 'nav.insurance', icon: ShieldCheck },
    { path: '/farmer/assistant', labelKey: 'nav.assistant', icon: Bot, highlight: true },
    { path: '/farmer/documents', labelKey: 'nav.documents', icon: FolderLock },
    { path: '/farmer/grievance', labelKey: 'nav.grievances', icon: HelpCircle },
    { path: '/farmer/reports', labelKey: 'nav.reports', icon: FileText },
    { path: '/farmer/profile', labelKey: 'nav.profile', icon: User },
  ];

  // Mobile Bottom Tab Bar: Exactly 5 items matching Image B
  const mobileBottomTabs = [
    { path: '/farmer', label: 'Home', labelKey: 'nav.home', icon: Home, exact: true },
    { path: '/farmer/schemes', label: 'Schemes', labelKey: 'nav.schemes', icon: Layers },
    { path: '/farmer/assistant', label: 'Assistant', labelKey: 'nav.assistant', icon: Bot },
    { path: '/farmer/reports', label: 'Reports', labelKey: 'nav.reports', icon: FileText },
    { path: '/farmer/profile', label: 'Profile', labelKey: 'nav.profile', icon: User },
  ];

  const isHome = location.pathname === '/farmer' || location.pathname === '/farmer/';

  // Helper to get screen title on mobile sub-pages
  const getSubpageMeta = () => {
    const path = location.pathname;
    if (path.includes('schemes')) return { title: 'My Schemes', subtitle: 'Government schemes you may be eligible for.' };
    if (path.includes('loan-verify')) return { title: 'Loan Verification', subtitle: 'Check if your loan details match the expected amount.' };
    if (path.includes('msp-verify')) return { title: 'MSP Mandi Verification', subtitle: 'Verify crop weight benchmark formula vs bank payout.' };
    if (path.includes('mandi')) return { title: 'Mandi Prices & Trends', subtitle: 'Daily market rates and official MSP benchmarks from Agmarknet.' };
    if (path.includes('weather')) return { title: 'Weather & Agro-Advisories', subtitle: 'Local forecast, rain probability, and deterministic crop advisories.' };
    if (path.includes('offices')) return { title: 'Nearby Offices', subtitle: 'Find agriculture extension offices, KVKs, Mandi and testing labs.' };
    if (path.includes('contact')) return { title: 'Contact Us & Helplines', subtitle: 'Reach out for platform support or access verified government helplines.' };
    if (path.includes('insurance-verify')) return { title: 'Crop Insurance', subtitle: 'Check your claim status and settlement.' };
    if (path.includes('assistant')) return { title: 'AI Assistant', subtitle: 'Ask anything about schemes, loans, MSP or crop insurance.' };
    if (path.includes('documents')) return { title: 'My Documents', subtitle: 'Secure, private vault for your agricultural and identity records.' };
    if (path.includes('grievance')) return { title: 'Raise a Grievance', subtitle: 'Report any issue related to loan, MSP, insurance or scheme.' };
    if (path.includes('reports')) return { title: 'My Reports', subtitle: 'View and download your financial and verification reports.' };
    if (path.includes('profile')) return { title: 'Profile', subtitle: 'Farmer profile and personal information.' };
    return { title: 'KisanVerify', subtitle: 'Agricultural Financial Transparency Platform' };
  };

  const meta = getSubpageMeta();

  return (
    <div className="min-h-[100dvh] bg-cream flex flex-col md:flex-row antialiased text-charcoal selection:bg-tint selection:text-forest">
      
      {/* ============================================================== */}
      {/* DESKTOP & TABLET SIDEBAR (Dark Forest Green matching Image A)   */}
      {/* ============================================================== */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-forest text-white flex-col justify-between shrink-0 shadow-xl relative z-20 select-none">
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="p-5 lg:p-6 border-b border-white/10">
            <Logo variant="mono-white" showTagline={true} size="md" />
          </div>

          {/* Nav items list */}
          <nav className="p-3.5 lg:p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-230px)]" aria-label="Sidebar Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === '/farmer' 
                ? (location.pathname === '/farmer' || location.pathname === '/farmer/')
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-cream-surface text-forest font-bold shadow-soft'
                      : 'text-white/85 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-forest' : 'text-white/80'}`} strokeWidth={isActive ? 2.2 : 1.75} />
                  <span className="truncate">{t(item.labelKey)}</span>
                  {item.highlight && !isActive && (
                    <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-olive text-white">
                      AI
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Rolling Field & Tractor Illustration */}
        <div className="mt-auto relative overflow-hidden pt-3 border-t border-white/10">
          <div className="px-5 py-2 text-[11px] text-white/70 flex items-center justify-between">
            <span className="font-medium">KisanVerify</span>
            <span className="px-2 py-0.5 rounded-full bg-white/15 text-white/90 text-[10px] font-mono">
              v1.0
            </span>
          </div>
          <img 
            src={tractorFieldImg} 
            alt="Agricultural field with tractor" 
            className="w-full h-16 object-cover object-bottom opacity-85 pointer-events-none" 
          />
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MAIN VIEWPORT (Content + Headers + Mobile Nav)                 */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        
        {/* ============================================================ */}
        {/* DESKTOP TOP HEADER (Namaste Greeting & Controls - Image A)   */}
        {/* ============================================================ */}
        <header className="hidden md:flex sticky top-0 z-30 bg-cream/90 backdrop-blur-md border-b border-warm-border px-6 lg:px-8 py-3.5 items-center justify-between">
          
          {/* Desktop Greeting */}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-charcoal tracking-tight flex items-center gap-2">
              <span>{language === 'hi' ? 'नमस्ते, ' + farmer.nameHi : 'Namaste, ' + farmer.name}</span>
              <span className="text-xl">👋</span>
            </h1>
            <p className="text-xs text-muted font-medium mt-0.5">
              {t('home.summary_sub')}
            </p>
          </div>

          {/* Action Pills & Profile */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-cream-surface border border-warm-border text-charcoal hover:bg-tint/50 transition-colors shadow-soft min-h-[38px]"
              aria-label="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-olive" />
              <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="w-9 h-9 rounded-full bg-cream-surface border border-warm-border flex items-center justify-center text-charcoal hover:bg-tint/40 transition-colors shadow-soft relative"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4 text-muted" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-status-discrepancy-text"></span>
              </button>

              {/* Notification Popover */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-cream-surface rounded-2xl shadow-dropdown border border-warm-border p-4 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between font-bold text-charcoal border-b border-warm-border pb-2.5 mb-2.5">
                    <span>Notifications</span>
                    <span className="text-[10px] font-semibold text-olive bg-tint px-2 py-0.5 rounded-full">2 New</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-status-discrepancy-bg border border-status-discrepancy-text/20">
                      <p className="font-bold text-status-discrepancy-text">Loan Discrepancy Flagged</p>
                      <p className="text-muted text-[11px] mt-0.5 leading-relaxed">Approved ₹80,000 vs Disbursed ₹70,000 difference needs review.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-status-review-bg border border-status-review-text/20">
                      <p className="font-bold text-status-review-text">MSP Payment Status</p>
                      <p className="text-muted text-[11px] mt-0.5 leading-relaxed">Paddy procurement ₹10,000 difference recorded for Patan mandi.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Farmer Profile Chip (Image A) */}
            <NavLink
              to="/farmer/profile"
              className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1 bg-cream-surface rounded-full border border-warm-border shadow-soft hover:border-olive transition-colors"
            >
              <img 
                src={farmer.avatarUrl || farmerAvatarImg} 
                alt={farmer.name} 
                className="w-8 h-8 rounded-full object-cover border border-warm-border"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-charcoal leading-tight">
                  {farmer.name}
                </span>
                <span className="text-[10px] font-mono text-muted leading-tight mt-0.5">
                  ID: {farmer.farmerId}
                </span>
              </div>
            </NavLink>
          </div>
        </header>

        {/* ============================================================ */}
        {/* MOBILE TOP HEADER (< 768px - Matching Image B)               */}
        {/* ============================================================ */}
        <div className="md:hidden sticky top-0 z-30">
          {isHome ? (
            /* Home Header Band: Dark Olive Green (Image B Screen 3) */
            <div className="bg-forest text-white px-4 py-3 safe-top flex items-center justify-between shadow-soft">
              <Logo variant="mono-white" showTagline={false} size="sm" />
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleLanguage}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
                  aria-label="Toggle language"
                >
                  {language === 'en' ? 'हिंदी' : 'EN'}
                </button>
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white relative hover:bg-white/20 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-saffron"></span>
                </button>
              </div>
            </div>
          ) : (
            /* Inner Sub-screens Header: Back Arrow + Title (Image B) */
            <div className="bg-cream/95 backdrop-blur-md border-b border-warm-border px-4 py-3 safe-top flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/farmer')}
                  className="w-9 h-9 rounded-full bg-cream-surface border border-warm-border flex items-center justify-center text-charcoal shadow-soft hover:bg-tint transition-colors active:scale-95"
                  aria-label="Go back to Home"
                >
                  <ArrowLeft className="w-4 h-4 text-charcoal" />
                </button>
                <div>
                  <h1 className="text-base font-bold text-charcoal tracking-tight leading-tight">
                    {meta.title}
                  </h1>
                  <p className="text-[11px] text-muted truncate max-w-[220px]">
                    {meta.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleLanguage}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-cream-surface border border-warm-border text-charcoal"
                >
                  {language === 'en' ? 'हि' : 'EN'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* MAIN OUTLET (Responsive Content Max-Width)                   */}
        {/* ============================================================ */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* ============================================================== */}
      {/* MOBILE BOTTOM TAB BAR (< 768px, Exactly 5 Tabs - Image B)      */}
      {/* ============================================================== */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream-surface/98 backdrop-blur-md border-t border-warm-border px-2 py-1.5 safe-bottom flex items-center justify-around shadow-[0_-4px_20px_rgba(35,45,25,0.06)]"
        aria-label="Mobile Navigation"
      >
        {mobileBottomTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact 
            ? (location.pathname === tab.path || location.pathname === tab.path + '/')
            : location.pathname.startsWith(tab.path);

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`flex-1 flex flex-col items-center py-1 min-h-[44px] justify-center rounded-xl transition-all ${
                isActive ? 'text-olive font-bold' : 'text-muted hover:text-charcoal'
              }`}
            >
              <Icon 
                className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.2] scale-105' : 'stroke-[1.75]'}`} 
              />
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-bold text-olive' : 'font-medium'}`}>
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
