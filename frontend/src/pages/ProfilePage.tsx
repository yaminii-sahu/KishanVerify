import React, { useState, useRef } from 'react';
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
  Camera,
  Upload,
  Trash2,
  Volume2,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import farmerAvatarImg from '../assets/illustrations/farmer-avatar.svg';

export const ProfilePage: React.FC = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { farmer, switchRole, updateFarmerAvatar } = useAuth();
  const navigate = useNavigate();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoReadAudio, setAutoReadAudio] = useState<boolean>(() => {
    return localStorage.getItem('kisanverify_auto_read_audio') === 'true';
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleAutoRead = () => {
    const nextVal = !autoReadAudio;
    setAutoReadAudio(nextVal);
    localStorage.setItem('kisanverify_auto_read_audio', String(nextVal));
    setToastMessage(
      nextVal
        ? (language === 'hi' ? 'परिणाम स्वतः पढ़कर सुनाना चालू किया गया' : 'Auto-read results aloud enabled')
        : (language === 'hi' ? 'परिणाम स्वतः पढ़कर सुनाना बंद किया गया' : 'Auto-read results aloud disabled')
    );
    setTimeout(() => setToastMessage(null), 2500);
  };

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          updateFarmerAvatar(compressed);
          setToastMessage(language === 'hi' ? 'प्रोफ़ाइल फ़ोटो अपडेट हो गई!' : 'Profile photo updated!');
          setShowPhotoModal(false);
          setTimeout(() => setToastMessage(null), 3000);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

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

        {/* Circular Avatar with Camera Badge */}
        <div className="relative -mt-12 flex justify-center">
          <div className="relative group">
            <img 
              src={farmer.avatarUrl || farmerAvatarImg} 
              alt={farmer.name} 
              className="w-24 h-24 rounded-full object-cover border-4 border-cream-surface shadow-soft bg-tint/30"
            />
            <button 
              onClick={() => setShowPhotoModal(true)}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-forest hover:bg-forest-dark border-2 border-cream-surface text-white flex items-center justify-center shadow-soft transition-transform active:scale-95"
              aria-label="Upload or take photo"
              title="Upload or take photo"
            >
              <Camera className="w-4 h-4" />
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

        {/* 4. Read results aloud automatically */}
        <button
          onClick={handleToggleAutoRead}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-tint/30 transition-colors min-h-[52px] cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-tint text-forest flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-charcoal block">
                {language === 'hi' ? 'परिणाम स्वतः पढ़कर सुनाएं' : 'Read results aloud automatically'}
              </span>
              <span className="text-[11px] text-muted block text-left">
                {language === 'hi' ? 'सत्यापन पूर्ण होने पर ऑडियो स्वतः शुरू करें' : 'Autoplay audio summary on verification'}
              </span>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            autoReadAudio ? 'bg-forest/15 text-forest' : 'bg-warm-border text-muted'
          }`}>
            {autoReadAudio ? (language === 'hi' ? 'चालू' : 'Enabled') : (language === 'hi' ? 'बंद' : 'Disabled')}
          </span>
        </button>

        {/* 5. About KisanVerify */}
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

      {/* Hidden File Inputs for Camera and Gallery */}
      <input 
        ref={cameraInputRef}
        type="file" 
        accept="image/*" 
        capture="user"
        className="hidden" 
        onChange={handleFileChange} 
      />
      <input 
        ref={galleryInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange} 
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-forest text-white px-4 py-2.5 rounded-full shadow-dropdown text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-tint" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Photo Upload / Camera Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-cream-surface rounded-t-3xl sm:rounded-2xl p-5 border border-warm-border shadow-dropdown space-y-4 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-warm-border pb-3">
              <h3 className="text-base font-bold text-charcoal">
                {language === 'hi' ? 'प्रोफ़ाइल फ़ोटो बदलें' : 'Profile Photo'}
              </h3>
              <button 
                onClick={() => setShowPhotoModal(false)}
                className="w-8 h-8 rounded-full hover:bg-tint flex items-center justify-center text-muted"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Take Photo with Camera */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full p-3.5 rounded-xl bg-cream hover:bg-tint/60 border border-warm-border flex items-center gap-3 text-left transition-colors active:scale-98"
              >
                <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center shrink-0 shadow-soft">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-charcoal">
                    {language === 'hi' ? 'कैमरा से फ़ोटो लें' : 'Take Photo with Camera'}
                  </p>
                  <p className="text-[11px] text-muted">
                    {language === 'hi' ? 'सीधे कैमरे से नई फ़ोटो खींचें' : 'Use your device camera directly'}
                  </p>
                </div>
              </button>

              {/* Option 2: Upload from Gallery / Files */}
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full p-3.5 rounded-xl bg-cream hover:bg-tint/60 border border-warm-border flex items-center gap-3 text-left transition-colors active:scale-98"
              >
                <div className="w-10 h-10 rounded-full bg-olive text-white flex items-center justify-center shrink-0 shadow-soft">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-charcoal">
                    {language === 'hi' ? 'गैलरी से फ़ोटो चुनें' : 'Upload from Gallery / Files'}
                  </p>
                  <p className="text-[11px] text-muted">
                    {language === 'hi' ? 'अपनी डिवाइस से इमेज चुनें' : 'Choose an existing photo from storage'}
                  </p>
                </div>
              </button>

              {/* Option 3: Remove custom photo (if exists) */}
              {farmer.avatarUrl && (
                <button
                  onClick={() => {
                    updateFarmerAvatar(null);
                    setToastMessage(language === 'hi' ? 'फ़ोटो हटा दी गई' : 'Photo removed');
                    setShowPhotoModal(false);
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="w-full p-3.5 rounded-xl bg-status-discrepancy-bg/50 hover:bg-status-discrepancy-bg border border-status-discrepancy-text/20 flex items-center gap-3 text-left transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-status-discrepancy-text text-white flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-status-discrepancy-text">
                      {language === 'hi' ? 'फ़ोटो हटाएं' : 'Remove Photo'}
                    </p>
                    <p className="text-[11px] text-muted">
                      {language === 'hi' ? 'डिफ़ॉल्ट अवतार पर वापस जाएं' : 'Revert to default avatar illustration'}
                    </p>
                  </div>
                </button>
              )}
            </div>

            <button
              onClick={() => setShowPhotoModal(false)}
              className="w-full py-2.5 rounded-xl bg-cream-surface border border-warm-border text-charcoal font-semibold text-xs hover:bg-tint transition-colors"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
