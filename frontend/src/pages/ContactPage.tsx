import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Send,
  FileText,
  FolderLock,
  Headphones,
  Landmark,
  Building2,
  Info,
  HelpCircle,
  Phone,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { VoiceCallModal } from '../components/VoiceCallModal';
import {
  fetchHelplinesApi,
  submitContactApi,
  fetchDocumentsApi,
  HelplineItem,
  DocumentItem,
  ContactSubmitResponse,
} from '../services/api';

const CATEGORIES = [
  { id: 'Loan Verification', labelEn: 'Loan Verification Discrepancy', labelHi: 'ऋण सत्यापन विसंगति' },
  { id: 'Mandi Discrepancy', labelEn: 'Mandi / MSP Payout Issue', labelHi: 'मंडी / एमएसपी भुगतान समस्या' },
  { id: 'Crop Insurance', labelEn: 'Crop Insurance Claim', labelHi: 'फसल बीमा क्लेम संबंधी' },
  { id: 'Scheme Query', labelEn: 'Scheme Eligibility & Application', labelHi: 'योजना पात्रता एवं आवेदन' },
  { id: 'Technical Support', labelEn: 'Technical / App Support', labelHi: 'तकनीकी / ऐप सहायता' },
  { id: 'Other', labelEn: 'General Feedback & Other', labelHi: 'अन्य सामान्य प्रश्न' },
];

export const ContactPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { farmer } = useAuth();

  const [helplines, setHelplines] = useState<HelplineItem[]>([]);
  const [loadingHelplines, setLoadingHelplines] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'helplines' | 'form'>('helplines');

  // Form State
  const [name, setName] = useState<string>(farmer?.name || 'Ramesh Kumar');
  const [phone, setPhone] = useState<string>(farmer?.phone || '9876543210');
  const [email, setEmail] = useState<string>('ramesh.kumar@example.com');
  const [category, setCategory] = useState<string>('Loan Verification');
  const [message, setMessage] = useState<string>('');
  const [attachedDocUuid, setAttachedDocUuid] = useState<string>('');
  const [honeypot, setHoneypot] = useState<string>(''); // Must stay empty!

  // Documents from vault for attachment
  const [vaultDocs, setVaultDocs] = useState<DocumentItem[]>([]);
  const [showDocPicker, setShowDocPicker] = useState<boolean>(false);

  // Submission Status
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<ContactSubmitResponse | null>(null);
  const [copiedTicket, setCopiedTicket] = useState<boolean>(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      setLoadingHelplines(true);
      try {
        const [hl, docs] = await Promise.all([
          fetchHelplinesApi(),
          fetchDocumentsApi(farmer?.farmerId || 'FV12345').catch(() => null),
        ]);
        setHelplines(hl || []);
        if (docs && docs.documents) {
          setVaultDocs(docs.documents);
        }
      } catch (err) {
        console.error('Failed to load contact data:', err);
      } finally {
        setLoadingHelplines(false);
      }
    }
    loadData();
  }, [farmer?.farmerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim()) {
      setSubmitError(isHi ? 'कृपया अपना नाम दर्ज करें।' : 'Please enter your name.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setSubmitError(isHi ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit phone number.');
      return;
    }
    if (!message.trim() || message.trim().length < 5) {
      setSubmitError(isHi ? 'कृपया कम से कम 5 अक्षरों का संदेश दर्ज करें।' : 'Please write a message with at least 5 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitContactApi({
        name,
        phone,
        email: email.trim() || undefined,
        category,
        message,
        attached_doc_uuid: attachedDocUuid || undefined,
        farmer_id: farmer?.farmerId || 'FV12345',
        website_url: honeypot || undefined,
      });
      setSubmittedTicket(res);
      setMessage('');
      setAttachedDocUuid('');
    } catch (err: any) {
      console.error('Submission failed:', err);
      const detail = err?.response?.data?.detail || err?.message || 'Failed to submit. Please try again.';
      setSubmitError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, type: 'ticket' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'ticket') {
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2000);
    } else {
      setCopiedPhone(text);
      setTimeout(() => setCopiedPhone(null), 2000);
    }
  };

  const selectedAttachedDoc = vaultDocs.find((d) => d.doc_uuid === attachedDocUuid);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Header */}
      <div className="bg-[#FAF7F2] border border-[#E6E0D4] rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isHi ? 'सत्यापित सरकारी हेल्पलाइन एवं समर्थन' : 'Verified GoI Helplines & Support'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#233316]">
              {isHi ? 'संपर्क केंद्र एवं आधिकारिक हेल्पलाइन' : 'Contact Us & Official Helplines'}
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6B4D] mt-1">
              {isHi
                ? 'कृषि मंत्रालय के आधिकारिक कॉल सेंटर से बात करें या किसानवेरीफाई टीम को सीधे संदेश भेजें।'
                : 'Directly dial verified government toll-free helplines or submit an inquiry to the KisanVerify team.'}
            </p>
          </div>

          {/* Quick tab switcher */}
          <div className="flex items-center bg-[#ECE6D8] p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('helplines')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'helplines'
                  ? 'bg-white text-[#2C3B1E] shadow-sm'
                  : 'text-[#5B6B4D] hover:text-[#2C3B1E]'
              }`}
            >
              {isHi ? 'सरकारी हेल्पलाइन' : 'Govt Helplines'}
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'form'
                  ? 'bg-white text-[#2C3B1E] shadow-sm'
                  : 'text-[#5B6B4D] hover:text-[#2C3B1E]'
              }`}
            >
              {isHi ? 'मंच सहायता फ़ॉर्म' : 'Support Form'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Section */}
      {activeTab === 'helplines' ? (
        /* ============================================================== */
        /* 1. VERIFIED GOVERNMENT HELPLINES LIST                           */
        /* ============================================================== */
        <div className="space-y-4">
          {/* AI Voice Call Support Card */}
          <div className="bg-gradient-to-r from-[#FAF9F5] to-[#EAEFE4] dark:from-stone-800 dark:to-stone-900 border border-[#556B2F]/30 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#556B2F] text-white flex items-center justify-center shrink-0 shadow-md">
                <Phone className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#6B8E23]/20 text-[#3E5224] dark:text-stone-200 text-[10px] font-bold uppercase tracking-wider mb-1">
                  {isHi ? 'तत्काल एआई वॉइस कॉल' : 'Instant AI Voice Call'}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#2C3B1E] dark:text-stone-100">
                  {isHi ? 'किसानवेरीफाई वॉइस सहायक से सीधे बात करें' : 'Talk Directly with KisanVerify Voice Assistant'}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 max-w-lg leading-relaxed">
                  {isHi
                    ? 'हिंदी या अंग्रेजी में बोलकर अपने केसीसी ऋण, धान एमएसपी भुगतान, फसल बीमा या योजनाओं की स्थिति जानें।'
                    : 'Speak in Hindi or English to check your KCC loan, MSP payment, PMFBY claims, or eligible schemes.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsVoiceCallOpen(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#556B2F] hover:bg-[#435424] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-soft hover:shadow-md transition-all active:scale-95 shrink-0"
            >
              <Phone className="w-4 h-4" />
              <span>{isHi ? '📞 अभी कॉल करें' : '📞 Call Support Now'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[#5B6B4D]" />
              <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider">
                {isHi ? 'अखिल भारतीय टोल-फ्री हेल्पलाइन' : 'All-India Toll-Free Government Helplines'}
              </h2>
            </div>
            <span className="text-xs text-stone-500">
              {isHi ? 'एक-टैप में सीधे कॉल करें' : 'Tap number to call directly'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadingHelplines ? (
              <div className="col-span-full bg-white border border-[#E6E0D4] rounded-2xl p-12 text-center text-sm text-stone-500">
                {isHi ? 'हेल्पलाइन लोड हो रही हैं...' : 'Loading verified helplines...'}
              </div>
            ) : (
              helplines.map((hl, idx) => (
                <div
                  key={hl.code || (hl as any).id || (hl as any).toll_free_number || idx}
                  className="bg-white border border-[#E6E0D4] hover:border-[#8B9A6E] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Verified badge & Department */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{isHi ? 'सत्यापित सरकारी सेवा' : 'Verified GoI Service'}</span>
                      </span>

                      {hl.is_toll_free && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                          {isHi ? 'निःशुल्क (Toll Free)' : 'Toll Free'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#1F2E14]">
                      {isHi && hl.title_hi ? hl.title_hi : hl.title}
                    </h3>
                    <p className="text-xs text-[#5B6B4D] font-medium mt-0.5 mb-2.5">
                      {hl.department}
                    </p>

                    <p className="text-xs text-stone-600 mb-3.5 leading-relaxed">
                      {isHi && hl.description_hi ? hl.description_hi : hl.description}
                    </p>

                    {/* Operational Details */}
                    <div className="space-y-1.5 text-xs text-stone-500 mb-4 bg-[#FBF9F5] p-2.5 rounded-xl border border-stone-100">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{hl.hours}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{hl.languages}</span>
                      </div>
                    </div>
                  </div>

                  {/* Call & Copy Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                    <a
                      href={`tel:${hl.number}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3D550C] hover:bg-[#2F4209] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>{hl.number}</span>
                    </a>

                    <button
                      onClick={() => copyToClipboard(hl.number, 'phone')}
                      className="p-2.5 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl transition-colors"
                      title={isHi ? 'नंबर कॉपी करें' : 'Copy number'}
                    >
                      {copiedPhone === hl.number ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* 2. KISANVERIFY PLATFORM SUPPORT FORM                            */
        /* ============================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="bg-white border border-[#E6E0D4] rounded-2xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-[#233316] mb-1">
                {isHi ? 'किसानवेरीफाई सहायता अनुरोध दर्ज करें' : 'Submit Support Inquiry to KisanVerify'}
              </h2>
              <p className="text-xs text-[#5B6B4D] mb-4">
                {isHi
                  ? 'वित्तीय विसंगति, ऋण अंतर या ऐप से संबंधित किसी भी समस्या के समाधान हेतु संदेश भेजें।'
                  : 'Submit queries regarding loan discrepancies, MSP calculation, or technical issues.'}
              </p>

              {/* Submitted Confirmation Card */}
              {submittedTicket && (
                <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-emerald-950">
                        {isHi ? 'अनुरोध सफलतापूर्वक दर्ज हो गया है!' : 'Inquiry Submitted Successfully!'}
                      </h3>
                      <p className="text-xs text-emerald-800">
                        {submittedTicket.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-emerald-200">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-emerald-800">
                        {isHi ? 'आपका टिकट संदर्भ संख्या' : 'Your Ticket Reference ID'}
                      </div>
                      <div className="text-base font-extrabold text-[#233316] tracking-wide">
                        {submittedTicket.ticket_id}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(submittedTicket.ticket_id, 'ticket')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-semibold transition-colors"
                      >
                        {copiedTicket ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{isHi ? 'कॉपी हुआ!' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{isHi ? 'आईडी कॉपी करें' : 'Copy ID'}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setSubmittedTicket(null)}
                        className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50"
                      >
                        {isHi ? 'नया संदेश भेजें' : 'Send another'}
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-emerald-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {isHi ? 'अपेक्षित प्रतिक्रिया समय:' : 'Expected response time:'}{' '}
                      <strong>{submittedTicket.turnaround_time}</strong>
                    </span>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot anti-spam field: hidden from humans */}
                <input
                  type="text"
                  name="website_url"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {isHi ? 'पूरा नाम' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B6B4D]"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {isHi ? 'मोबाइल नंबर (10 अंक)' : 'Mobile Number (10 digits)'} *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="e.g. 9876543210"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B6B4D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {isHi ? 'समस्या की श्रेणी' : 'Inquiry Category'} *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5B6B4D]"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {isHi ? c.labelHi : c.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {isHi ? 'ईमेल (वैकल्पिक)' : 'Email Address (Optional)'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ramesh@example.com"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B6B4D]"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isHi ? 'संदेश / विवरण' : 'Message / Details'} *
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder={
                      isHi
                        ? 'कृपया अपनी समस्या या विसंगति का विस्तार से वर्णन करें...'
                        : 'Please describe the discrepancy, calculation error, or question in detail...'
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B6B4D] resize-none"
                  />
                </div>

                {/* Vault Document Attachment Selector */}
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E6E0D4] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2C3B1E]">
                      <FolderLock className="w-3.5 h-3.5 text-[#5B6B4D]" />
                      <span>{isHi ? 'माई डॉक्यूमेंट्स से संलग्न करें (वैकल्पिक)' : 'Attach from My Documents Vault (Optional)'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowDocPicker(!showDocPicker)}
                      className="text-xs font-bold text-emerald-800 hover:underline"
                    >
                      {showDocPicker ? (isHi ? 'बंद करें' : 'Close') : (isHi ? 'दस्तावेज़ चुनें' : 'Choose Document')}
                    </button>
                  </div>

                  {selectedAttachedDoc && (
                    <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-emerald-200 text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-stone-800">{selectedAttachedDoc.original_name}</span>
                        <span className="text-stone-400">({(selectedAttachedDoc.size_bytes / 1024).toFixed(0)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachedDocUuid('')}
                        className="text-rose-600 hover:text-rose-800 font-bold ml-2"
                      >
                        &times;
                      </button>
                    </div>
                  )}

                  {showDocPicker && (
                    <div className="pt-2 border-t border-[#E6E0D4] space-y-1.5">
                      {vaultDocs.length === 0 ? (
                        <p className="text-[11px] text-stone-500">
                          {isHi ? 'आपके वॉल्ट में कोई दस्तावेज़ नहीं है।' : 'No documents in your vault.'}
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {vaultDocs.map((doc) => (
                            <button
                              type="button"
                              key={doc.doc_uuid}
                              onClick={() => {
                                setAttachedDocUuid(doc.doc_uuid);
                                setShowDocPicker(false);
                              }}
                              className={`text-left p-2 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                                attachedDocUuid === doc.doc_uuid
                                  ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                                  : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-700'
                              }`}
                            >
                              <div className="truncate pr-2">
                                <div className="truncate">{doc.original_name}</div>
                                <div className="text-[10px] text-stone-400">{doc.category}</div>
                              </div>
                              {attachedDocUuid === doc.doc_uuid && (
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#3D550C] hover:bg-[#2F4209] text-white rounded-xl text-xs sm:text-sm font-bold shadow-soft transition-all disabled:opacity-60"
                >
                  <Send className={`w-4 h-4 ${submitting ? 'animate-bounce' : ''}`} />
                  <span>
                    {submitting
                      ? isHi
                        ? 'दर्ज किया जा रहा है...'
                        : 'Submitting ticket...'
                      : isHi
                      ? 'सहायता टिकट दर्ज करें'
                      : 'Submit Support Ticket'}
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* Side Info Cards */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#FAF7F2] border border-[#E6E0D4] rounded-2xl p-4 sm:p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D550C]">
                {isHi ? 'प्रतिक्रिया की प्रतिबद्धता' : 'Our Commitment'}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isHi
                  ? 'सभी प्रश्नों का निवारण किसानवेरीफाई की टीम द्वारा 24 व्यावसायिक घंटों के भीतर किया जाता है। आपातकालीन कृषि सलाह के लिए किसान कॉल सेंटर 1800-180-1551 पर कॉल करें।'
                  : 'All queries are assigned a unique trackable ticket ID and reviewed by our verification desk within 24 business hours.'}
              </p>
              <div className="pt-2 border-t border-[#E6E0D4] flex items-center gap-2 text-xs font-semibold text-[#2C3B1E]">
                <Clock className="w-3.5 h-3.5 text-[#5B6B4D]" />
                <span>{isHi ? 'टर्नअराउंड: 24 व्यावसायिक घंटे' : 'Turnaround: 24 business hours'}</span>
              </div>
            </div>

            <div className="bg-white border border-[#E6E0D4] rounded-2xl p-4 sm:p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                <span>{isHi ? 'त्वरित सहायता' : 'Emergency Farm Call'}</span>
              </div>
              <p className="text-xs text-stone-600">
                {isHi
                  ? 'तत्काल कीट नियंत्रण, बीज या मौसम सलाह के लिए:'
                  : 'For immediate agricultural or weather advice:'}
              </p>
              <a
                href="tel:18001801551"
                className="block text-center py-2 px-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                📞 1800-180-1551 (Toll Free)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Honest Disclaimer Footnote */}
      <div className="bg-[#FAF7F2] border border-[#E6E0D4] rounded-2xl p-4 text-xs text-[#5B6B4D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#8B9A6E] flex-shrink-0" />
          <span>
            {isHi
              ? 'किसानवेरीफाई एक स्वतंत्र पारदर्शी मंच है। आधिकारिक वैधानिक दावों के लिए संबंधित सरकारी कार्यालय अथवा टोल-फ्री हेल्पलाइन से संपर्क करें।'
              : 'KisanVerify is an independent civic transparency platform. For official statutory claim filings, dial the verified government helplines.'}
          </span>
        </div>
        <div className="text-[11px] text-stone-500">
          {isHi ? 'अंतिम सत्यापन: अप्रैल 2025' : 'Last verified: April 2025'}
        </div>
      </div>
      {/* Voice Call Support Modal */}
      <VoiceCallModal
        isOpen={isVoiceCallOpen}
        onClose={() => setIsVoiceCallOpen(false)}
        language={language === 'hi' ? 'hi' : 'en'}
      />
    </div>
  );
};

export default ContactPage;
