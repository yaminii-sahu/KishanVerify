import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Share2, 
  Volume2, 
  Flag, 
  PhoneCall, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  FileCheck2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Loader2,
  Calendar,
  Layers,
  ChevronRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { fetchReportDetailApi } from '../services/api';
import { apiClient } from '../lib/api';
import { BasisOfCheckCard } from '../components/BasisOfCheckCard';
import { AudioSummaryPlayer } from '../components/AudioSummaryPlayer';

export const ReportDetailPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  const isHi = language === 'hi';
  const [report, setReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadDetail = async () => {
      setIsLoading(true);
      try {
        const data = await fetchReportDetailApi(reportId || 'REP-LN-2025-01');
        if (isMounted) setReport(data);
      } catch (err) {
        console.error('Error fetching report detail', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadDetail();
    return () => { isMounted = false; };
  }, [reportId]);

  const handleDownloadPdf = async () => {
    if (!report) return;
    setIsDownloading(true);
    try {
      const filename = `${report.report_ref}_${(report.report_type || 'Report').replace(/\s+/g, '_')}.pdf`;
      await apiClient.download(`/reports/download/${report.report_ref}`, filename);
    } catch (err) {
      console.warn('PDF download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: report?.title || 'KisanVerify Reconciliation Report',
      text: `KisanVerify Report ${report?.report_ref}: Status: ${report?.status}. Difference: ₹${report?.figures?.difference?.toLocaleString() || 0}.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User dismissed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  const handleRaiseGrievance = () => {
    if (!report) return;
    navigate('/farmer/grievance', {
      state: {
        prefill: {
          issueType: report.grievance_prefill?.issue_type || 'Loan Discrepancy',
          bankName: report.farmer?.bank_name || 'State Bank of India',
          differenceAmount: report.figures?.difference || 0,
          reportRef: report.report_ref,
          suggestedNote: report.grievance_prefill?.suggested_note || '',
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
        <p className="text-xs font-semibold text-muted">
          {isHi ? 'विस्तृत रिपोर्ट लोड हो रही है...' : 'Loading comprehensive report statement...'}
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-cream-surface rounded-2xl p-8 border border-warm-border text-center space-y-3 max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-status-discrepancy-text mx-auto" />
        <h3 className="text-base font-bold text-charcoal">
          {isHi ? 'रिपोर्ट नहीं मिली' : 'Report Not Found'}
        </h3>
        <p className="text-xs text-muted">
          {isHi ? 'अनुरोधित संदर्भ रिपोर्ट उपलब्ध नहीं है।' : 'The requested report reference could not be loaded.'}
        </p>
        <button
          onClick={() => navigate('/farmer/reports')}
          className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold"
        >
          {isHi ? 'सभी रिपोर्टों पर वापस जाएं' : 'Back to Reports'}
        </button>
      </div>
    );
  }

  const isFlagged = report.is_flagged;
  const isMsp = report.report_type?.includes('MSP');
  const figures = report.figures || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-border pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/farmer/reports')}
            className="w-10 h-10 rounded-xl bg-cream-surface border border-warm-border flex items-center justify-center text-charcoal hover:bg-tint transition-colors shadow-soft"
            aria-label="Back to reports list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-forest uppercase tracking-wider">
                {report.report_ref}
              </span>
              <span className="text-xs text-muted">•</span>
              <span className="text-xs text-muted flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {report.report_date}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-charcoal tracking-tight mt-0.5">
              {isHi ? report.title_hi || report.title : report.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons: PDF, Print, Share */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleShare}
            className="px-3 py-2 rounded-xl bg-cream-surface border border-warm-border hover:bg-tint text-charcoal text-xs font-semibold shadow-soft flex items-center gap-1.5 transition-all"
            title="Share report"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{shareSuccess ? (isHi ? 'कॉपी हो गया!' : 'Copied!') : (isHi ? 'साझा करें' : 'Share')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="hidden sm:inline-flex px-3 py-2 rounded-xl bg-cream-surface border border-warm-border hover:bg-tint text-charcoal text-xs font-semibold shadow-soft items-center gap-1.5 transition-all"
            title="Print report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isHi ? 'प्रिंट' : 'Print'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-bold shadow-soft flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isHi ? 'पीडीएफ डाउनलोड' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 ${
        isFlagged 
          ? 'bg-status-discrepancy-bg border-status-discrepancy-text/30' 
          : 'bg-status-eligible-bg border-status-eligible-text/30'
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-soft ${
          isFlagged 
            ? 'bg-white text-status-discrepancy-text' 
            : 'bg-white text-status-eligible-text'
        }`}>
          {isFlagged ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className={`text-sm sm:text-base font-bold ${
              isFlagged ? 'text-status-discrepancy-text' : 'text-status-eligible-text'
            }`}>
              {isHi ? report.status_label_hi || report.status_label : report.status_label}
            </h3>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              isFlagged ? 'bg-status-discrepancy-text text-white' : 'bg-status-eligible-text text-white'
            }`}>
              {report.status}
            </span>
          </div>
          <p className="text-xs text-charcoal/90 mt-1 leading-relaxed">
            {isHi ? report.explanation_hi || report.explanation : report.explanation}
          </p>
        </div>
      </div>

      {/* Spoken Audio Summary Player */}
      <AudioSummaryPlayer
        checkType={isMsp ? 'msp' : 'loan'}
        approvedAmount={figures.approved_amount}
        disbursedAmount={figures.disbursed_amount}
        difference={figures.difference}
        bankName={report.farmer?.bank_name}
        crop={figures.crop}
        quantity={figures.quantity_quintals}
        rate={figures.msp_rate}
        expectedPayment={figures.expected_payment}
        actualPayment={figures.actual_payment}
        procurementCenter={figures.procurement_center}
      />

      {/* 1. Beneficiary & Institutional Particulars Card */}
      <div className="bg-cream-surface rounded-2xl border border-warm-border p-4 sm:p-5 space-y-3 shadow-soft">
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-forest" />
          <span>{isHi ? '1. लाभार्थी एवं संस्थागत विवरण' : '1. Beneficiary & Institutional Particulars'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-cream/70 border border-warm-border/60">
            <span className="text-[11px] text-muted block mb-0.5">{isHi ? 'किसान का नाम' : 'Farmer Name'}</span>
            <strong className="text-charcoal block truncate">
              {isHi ? report.farmer?.name_hi || report.farmer?.name : report.farmer?.name}
            </strong>
            <span className="text-[10px] text-forest font-mono">{report.farmer?.farmer_id}</span>
          </div>

          <div className="p-3 rounded-xl bg-cream/70 border border-warm-border/60">
            <span className="text-[11px] text-muted block mb-0.5">{isHi ? 'स्थान' : 'Location'}</span>
            <strong className="text-charcoal block truncate">
              {report.farmer?.village}, {report.farmer?.district}
            </strong>
            <span className="text-[10px] text-muted">{report.farmer?.state}</span>
          </div>

          <div className="p-3 rounded-xl bg-cream/70 border border-warm-border/60">
            <span className="text-[11px] text-muted block mb-0.5">
              {isMsp ? (isHi ? 'उपार्जन केंद्र' : 'Procurement Mandi') : (isHi ? 'संबंधित बैंक' : 'Lending Bank')}
            </span>
            <strong className="text-charcoal block truncate">
              {isMsp ? figures.procurement_center || 'Patan Mandi' : report.farmer?.bank_name}
            </strong>
            <span className="text-[10px] text-muted">{isMsp ? 'APMC Mandi Samiti' : 'Public Sector Bank'}</span>
          </div>

          <div className="p-3 rounded-xl bg-cream/70 border border-warm-border/60">
            <span className="text-[11px] text-muted block mb-0.5">
              {isMsp ? (isHi ? 'उपार्जित फसल' : 'Procured Crop') : (isHi ? 'खाता संख्या (गोपनीय)' : 'Account Ref')}
            </span>
            <strong className="text-charcoal block truncate">
              {isMsp ? figures.crop || 'Paddy' : report.farmer?.account_number_masked}
            </strong>
            <span className="text-[10px] text-forest font-semibold">{isMsp ? 'Kharif 2024-25' : 'KCC Active'}</span>
          </div>
        </div>
      </div>

      {/* 2. Deterministic Financial Reconciliation Table */}
      <div className="bg-cream-surface rounded-2xl border border-warm-border p-4 sm:p-5 space-y-4 shadow-soft">
        <div className="flex items-center justify-between border-b border-warm-border/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-charcoal">
              {isHi ? '2. वित्तीय मिलान एवं गणितीय विवरण' : '2. Financial Reconciliation & Arithmetic'}
            </h3>
            <p className="text-[11px] text-muted">
              {isHi ? 'स्वीकृत पात्रता बनाम वास्तविक भुगतान का तुलनात्मक विश्लेषण' : 'Comparative audit of statutory entitlement against recorded disbursement'}
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-forest/10 text-forest border border-forest/20">
            {isHi ? 'सटीक गणितीय मिलान' : 'Deterministic Check'}
          </span>
        </div>

        {/* Arithmetic Rows */}
        <div className="divide-y divide-warm-border border-y border-warm-border py-1 text-xs">
          {report.arithmetic_breakdown?.map((item: any, idx: number) => {
            const isDiff = item.label.toLowerCase().includes('diff') || item.label.toLowerCase().includes('unexplained');
            return (
              <div
                key={idx}
                className={`flex items-center justify-between py-2.5 px-2 rounded-lg ${
                  isDiff && item.amount > 0 ? 'bg-status-discrepancy-bg/50 font-bold' : ''
                }`}
              >
                <span className={isDiff ? 'font-bold text-charcoal' : 'text-muted font-medium'}>
                  {isHi ? item.label_hi || item.label : item.label}
                </span>
                <span className={`text-sm ${
                  isDiff
                    ? (item.amount > 0 ? 'text-status-discrepancy-text font-extrabold' : 'text-status-eligible-text font-bold')
                    : 'font-bold text-charcoal'
                }`}>
                  ₹ {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            );
          })}
        </div>

        {/* Net Difference Callout Box */}
        <div className="p-3.5 rounded-xl bg-warm-bg border border-warm-border flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-charcoal block">
              {isHi ? 'शुद्ध मिलान निष्कर्ष' : 'Net Reconciliation Outcome'}
            </span>
            <p className="text-[11px] text-muted">
              {figures.difference > 0
                ? (isHi ? 'समीक्षा हेतु अस्पष्ट अंतर पहचाना गया है।' : 'An unexplained variance has been flagged for institutional review.')
                : (isHi ? 'सभी आंकड़े वैधानिक पात्रता और रिकॉर्ड से पूर्णतः मेल खाते हैं।' : 'All figures match official entitlement records.')}
            </p>
          </div>
          <span className={`text-base sm:text-lg font-extrabold ${
            figures.difference > 0 ? 'text-status-discrepancy-text' : 'text-status-eligible-text'
          }`}>
            ₹ {figures.difference?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* 3. Basis of This Check (Cited Statutory Rules) */}
      <BasisOfCheckCard
        checkType={isMsp ? 'msp' : 'loan'}
        sources={report.sources}
        flaggedRuleCode={report.flagged_rule_code}
        flaggedRuleThreshold={report.flagged_rule_threshold}
        flaggedRuleReasonEn={report.flagged_rule_reason_en}
        flaggedRuleReasonHi={report.flagged_rule_reason_hi}
        isFlagged={isFlagged}
        arithmetic={{
          approved: figures.approved_amount,
          disbursed: figures.disbursed_amount,
          deductions: figures.deductions,
          difference: figures.difference,
          unaccounted: figures.unaccounted_difference,
          crop: figures.crop,
          quantity: figures.quantity_quintals,
          rate: figures.msp_rate,
          expected: figures.expected_payment,
          actual: figures.actual_payment,
        }}
      />

      {/* 4. Potential Procedural Reasons (Calm & Non-Accusatory) */}
      <div className="bg-cream-surface rounded-2xl border border-warm-border p-4 sm:p-5 space-y-3 shadow-soft">
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-forest" />
          <span>{isHi ? '4. अंतर के संभावित वैध प्रशासनिक कारण' : '4. Potential Administrative Explanations'}</span>
        </h3>

        <p className="text-xs text-charcoal/80 leading-relaxed">
          {isHi
            ? 'किसानवेरीफाई प्रणाली गणनाओं का निष्पक्ष गणितीय मिलान करती है। किसी अंतर का होना अनियमितता का प्रमाण नहीं है। सामान्य प्रशासनिक कारणों में शामिल हैं:'
            : 'KisanVerify performs deterministic mathematical verification. The identification of a difference does not represent wrongdoing. Common procedural causes include:'}
        </p>

        <ul className="space-y-2 text-xs text-charcoal/90 pt-1">
          {(isHi && report.reasons_hi?.length ? report.reasons_hi : report.reasons)?.map((r: string, idx: number) => (
            <li key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-cream/50 border border-warm-border/40">
              <span className="w-1.5 h-1.5 rounded-full bg-forest mt-1.5 shrink-0" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 5. Recommended Next Steps for Farmer */}
      <div className="bg-cream-surface rounded-2xl border border-warm-border p-4 sm:p-5 space-y-4 shadow-soft">
        <div className="flex items-center justify-between border-b border-warm-border/80 pb-3">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-forest" />
            <span>{isHi ? '5. किसान के लिए अनुशंसित आगामी कदम' : '5. Recommended Actionable Next Steps'}</span>
          </h3>
          <span className="text-[11px] font-semibold text-forest">
            {isHi ? 'सहायता केंद्र उपलब्ध' : 'Helplines Available'}
          </span>
        </div>

        <ul className="space-y-2.5 text-xs text-charcoal leading-relaxed">
          {(isHi && report.next_steps_hi?.length ? report.next_steps_hi : report.next_steps)?.map((s: string, idx: number) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-forest/10 text-forest font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                {idx}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ul>

        {/* Action Quick Links: Nearby Offices & Kisan Call Centre */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Nearby Offices Link */}
          <button
            type="button"
            onClick={() => navigate('/farmer/offices')}
            className="p-3.5 rounded-xl bg-tint hover:bg-forest/15 border border-forest/20 flex items-center justify-between text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white text-forest flex items-center justify-center shadow-soft">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs text-charcoal block group-hover:text-forest transition-colors">
                  {isHi ? 'निकटतम कृषि कार्यालय देखें' : 'Find Nearby Agriculture Offices'}
                </strong>
                <span className="text-[11px] text-muted">
                  {isHi ? 'पाटन केवीके, मंडी एवं लीड बैंक शाखा' : 'KVK Patan, APMC Mandi, Lead Bank'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-forest" />
          </button>

          {/* Kisan Call Centre Toll-Free Phone Link */}
          <a
            href="tel:18001801551"
            className="p-3.5 rounded-xl bg-forest/10 hover:bg-forest/20 border border-forest/20 flex items-center justify-between text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white text-forest flex items-center justify-center shadow-soft">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-xs text-charcoal block group-hover:text-forest transition-colors">
                  {isHi ? 'किसान कॉल सेंटर (टोल-फ्री)' : 'Kisan Call Centre (Toll-Free)'}
                </strong>
                <span className="text-[11px] font-bold text-forest">1800-180-1551</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest text-white">
              {isHi ? 'कॉल करें' : 'Call'}
            </span>
          </a>
        </div>

        {/* Primary Action Button: Raise Grievance Pre-Filled */}
        {isFlagged && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleRaiseGrievance}
              className="w-full h-[50px] rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-sm shadow-soft flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Flag className="w-4 h-4 text-amber-300" />
              <span>
                {isHi
                  ? `इस रिपोर्ट के साथ शिकायत दर्ज करें (संदर्भ: ${report.report_ref})`
                  : `Raise a Grievance with this Report (${report.report_ref})`}
              </span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
