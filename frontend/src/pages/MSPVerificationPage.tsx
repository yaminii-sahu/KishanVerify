import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Coins, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  HelpCircle, 
  Calculator, 
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { verifyMspApi, fetchVerificationRecordByRefApi } from '../services/api';
import { BasisOfCheckCard } from '../components/BasisOfCheckCard';
import { AudioSummaryPlayer } from '../components/AudioSummaryPlayer';
import { MSPTimelineView } from '../components/MSPTimelineView';
import { MSPAdjustmentsBreakdownCard } from '../components/MSPAdjustmentsBreakdownCard';

export const MSPVerificationPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeParams = useParams();
  const recordId = searchParams.get('recordId') || searchParams.get('record_ref') || routeParams.id;

  // Form Inputs (Blueprint example: 50 quintals * 2300 = 115000 expected, 105000 received, diff 10000)
  const [crop, setCrop] = useState('Paddy (Common)');
  const [quantity, setQuantity] = useState<number>(50);
  const [mspRate, setMspRate] = useState<number>(2300);
  const [actualPayment, setActualPayment] = useState<number>(105000);
  const [procurementCenter, setProcurementCenter] = useState('Patan Krishi Upaj Mandi');

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'verify' | 'timeline'>('verify');

  // Load record and pre-fill when recordId is passed via URL query/param
  useEffect(() => {
    if (!recordId) return;
    let isMounted = true;
    async function loadRecord() {
      setIsLoading(true);
      try {
        const res = await fetchVerificationRecordByRefApi(recordId!);
        if (isMounted && res?.data) {
          if (res.data.crop) setCrop(res.data.crop);
          if (res.data.quantity !== undefined) setQuantity(Number(res.data.quantity));
          if (res.data.msp_rate !== undefined) setMspRate(Number(res.data.msp_rate));
          if (res.data.actual_payment !== undefined) setActualPayment(Number(res.data.actual_payment));
          if (res.data.procurement_center) setProcurementCenter(res.data.procurement_center);

          if (res.verification) {
            setResult(res.verification);
          } else {
            const vRes = await verifyMspApi({
              crop: res.data.crop || 'Paddy (Common)',
              quantity_quintals: Number(res.data.quantity || 50),
              msp_rate: Number(res.data.msp_rate || 2300),
              actual_payment: Number(res.data.actual_payment || 105000),
              procurement_center: res.data.procurement_center || 'Patan Krishi Upaj Mandi',
            });
            if (isMounted) setResult(vRes);
          }
        }
      } catch (err) {
        console.warn('Could not load MSP record by ref', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadRecord();
  }, [recordId]);
  const [result, setResult] = useState<any | null>({
    status: 'Needs Review',
    crop: 'Paddy (Common)',
    quantity_quintals: 50,
    msp_rate: 2300,
    expected_payment: 115000,
    actual_payment: 105000,
    difference: 10000,
    is_flagged: true,
    status_label: 'Payment Discrepancy Detected',
    status_label_hi: 'भुगतान अंतर पाया गया',
    explanation: 'Based on 50 quintals at ₹2,300.00/qtl, the expected payment is ₹115,000.00. The payment received is ₹105,000.00, leaving a difference of ₹10,000.00.',
    explanation_hi: '50 क्विंटल फसल की ₹2,300.00/क्विंटल की दर से अपेक्षित राशि ₹115,000.00 है। प्राप्त राशि ₹105,000.00 है, जिससे ₹10,000.00 का अंतर बनता है।',
    flagged_rule_code: 'RULE-MSP-PAYMENT',
    flagged_rule_threshold: 'Actual Payment < Expected (Quantity × Statutory MSP Rate)',
    flagged_rule_reason_en: 'Received payment (₹105,000.00) is lower than statutory entitlement (₹115,000.00) by ₹10,000.00.',
    flagged_rule_reason_hi: 'प्राप्त भुगतान (₹105,000.00) वैधानिक पात्रता (₹115,000.00) से ₹10,000.00 कम है।',
    sources: [
      {
        rule_code: 'CACP-MSP-KHARIF-PADDY-2024',
        scheme_name: 'Minimum Support Price (MSP)',
        scheme_name_hi: 'न्यूनतम समर्थन मूल्य (एमएसपी)',
        rule_type: 'msp',
        title: 'Price Policy for Kharif Crops: Paddy (Common)',
        title_hi: 'खरीफ मूल्य नीति: धान (सामान्य)',
        formula_or_value: '₹2,300 / quintal',
        source_name: 'Commission for Agricultural Costs and Prices (CACP) / DA&FW, GoI',
        source_document: 'Price Policy for Kharif Crops: The Marketing Season 2024-25',
        source_url: 'https://cacp.dacnet.nic.in',
        authority: 'CACP / DA&FW, GoI',
        document: 'Price Policy for Kharif Crops: The Marketing Season 2024-25',
        url: 'https://cacp.dacnet.nic.in',
        effective_from: '2024-10-01',
        effective_to: '2025-09-30',
        last_verified_on: '2025-04-10',
        status: 'verified',
        data_origin: 'official',
        field_associated: 'msp_rate',
        details: 'Statutory MSP for Paddy (Common) (Kharif 2024-25): ₹2,300.00 per quintal.',
        details_hi: 'धान (सामान्य) के लिए वैधानिक एमएसपी (खरीफ 2024-25): ₹2,300.00 प्रति क्विंटल।',
      },
      {
        rule_code: 'MANDI-JFORM-RECEIPT',
        scheme_name: 'Mandi Procurement Receipt / J-Form',
        scheme_name_hi: 'मंडी खरीद रसीद / जे-फॉर्म',
        rule_type: 'msp',
        title: 'Weighbridge Slip & Mandi J-Form',
        title_hi: 'तौल पर्ची एवं मंडी जे-फॉर्म',
        source_name: 'Patan Krishi Upaj Mandi',
        source_document: 'Weighbridge Slip & Mandi J-Form',
        source_url: 'https://enam.gov.in',
        authority: 'Patan Krishi Upaj Mandi',
        document: 'Weighbridge Slip & Mandi J-Form',
        url: 'https://enam.gov.in',
        effective_from: '2024-10-01',
        effective_to: null,
        last_verified_on: '2025-04-10',
        status: 'verified',
        data_origin: 'bank_document',
        field_associated: 'quantity_quintals',
        details: 'Procured quantity: 50 quintals recorded at Patan Krishi Upaj Mandi.',
        details_hi: 'उपार्जित मात्रा: 50 क्विंटल पाटन कृषि उपज मंडी में दर्ज।',
      },
      {
        rule_code: 'PFMS-DBT-SETTLEMENT',
        scheme_name: 'Public Financial Management System (PFMS) DBT',
        scheme_name_hi: 'सार्वजनिक वित्तीय प्रबंधन प्रणाली (PFMS) डीबीटी',
        rule_type: 'msp',
        title: 'DBT Procurement Settlement Protocol',
        title_hi: 'डीबीटी उपार्जन भुगतान निपटान दिशानिर्देश',
        source_name: 'Ministry of Finance / DA&FW, GoI',
        source_document: 'DBT Procurement Settlement Protocol',
        source_url: 'https://pfms.nic.in',
        authority: 'Ministry of Finance / DA&FW, GoI',
        document: 'DBT Procurement Settlement Protocol',
        url: 'https://pfms.nic.in',
        effective_from: '2024-04-01',
        effective_to: null,
        last_verified_on: '2025-04-10',
        status: 'verified',
        data_origin: 'user_entered',
        field_associated: 'actual_payment',
        details: 'Actual bank credit recorded: ₹105,000.00.',
        details_hi: 'बैंक खाते में दर्ज जमा राशि: ₹105,000.00।',
      },
    ],
    reasons: [
      'Quality moisture discount (refraction / FAQ grade variation)',
      'Partial procurement disbursement released; remaining balance scheduled',
      'Mandi cess, handling charges, or gunny bag security withheld',
      'Bank transaction delay or IFSC settlement pending',
    ],
    gross_expected: 115000,
    total_explained_adjustments: 6525,
    unexplained_difference: 3475,
    adjustments: [
      {
        id: 'adj-hamali',
        category: 'hamali',
        label_en: 'Handling / Loading Charges (Hamali)',
        label_hi: 'हम्माली / उतराई शुल्क',
        amount: 625,
        rate_rule: '₹12.50 / quintal statutory APMC ceiling',
        is_statutory: true,
        is_flagged: false,
        authority: 'APMC Mandi By-Laws',
        data_origin: 'official',
      },
      {
        id: 'adj-moisture',
        category: 'quality_cut',
        label_en: 'Moisture & FAQ Quality Cut',
        label_hi: 'नमी व गुणवत्ता कटौती (FAQ)',
        amount: 1150,
        rate_rule: '₹23.00 / quintal standard refraction cut',
        is_statutory: true,
        is_flagged: false,
        authority: 'Food Corporation of India (FCI) / CACP',
        data_origin: 'official',
      },
      {
        id: 'adj-bardana',
        category: 'bardana',
        label_en: 'Gunny Bag Retention / Bardana',
        label_hi: 'बारदाना कटौती',
        amount: 750,
        rate_rule: '₹15.00 / bag security deduction',
        is_statutory: true,
        is_flagged: false,
        authority: 'State Civil Supplies Corporation',
        data_origin: 'official',
      },
      {
        id: 'adj-pacs',
        category: 'loan_recovery',
        label_en: 'PACS Cooperative Society Crop Loan Recovery',
        label_hi: 'पैक्स सहकारी समिति अल्पावधि फसल ऋण समायोजन',
        amount: 4000,
        rate_rule: 'Direct cooperative ledger credit against outstanding KCC',
        is_statutory: true,
        is_flagged: false,
        authority: 'District Central Cooperative Bank (DCCB)',
        data_origin: 'bank_document',
      },
      {
        id: 'adj-unexplained',
        category: 'unexplained',
        label_en: 'Unexplained Difference',
        label_hi: 'अस्पष्ट अंतर (समीक्षा आवश्यक)',
        amount: 3475,
        rate_rule: 'No corresponding statutory rule or receipt line item found',
        is_statutory: false,
        is_flagged: true,
        flag_reason_en: 'This variance is not covered by notified APMC fee schedules or recorded deductions and may need review.',
        flag_reason_hi: 'यह राशि अधिसूचित मंडी शुल्क नियमों या दर्ज कटौतियों में शामिल नहीं है और समीक्षा योग्य है।',
        authority: 'Mandi Accounting Office',
        data_origin: 'user_entered',
      },
    ],
    questions_to_ask: [
      {
        id: 'q1',
        category: 'mandi_cess',
        target_authority: 'Mandi Secretary / APMC',
        statutory_reference: 'Chhattisgarh Krishi Upaj Mandi Adhiniyam 1972 Section 19',
        question_en: 'As per APMC Mandi Adhiniyam Section 19, mandi fees are statutory obligations of the buyer/procurement agency. Was any mandi fee withheld from my procurement payout?',
        question_hi: 'मंडी अधिनियम की धारा 19 के अनुसार मंडी शुल्क क्रेता/उपार्जन एजेंसी द्वारा देय है। क्या मेरे भुगतान से कोई मंडी शुल्क काटा गया है?',
      },
      {
        id: 'q2',
        category: 'moisture_refraction',
        target_authority: 'Procurement Center In-Charge',
        statutory_reference: 'CACP Uniform Specifications for FAQ Kharif Foodgrains',
        question_en: 'What certified moisture content was logged on my weighbridge slip, and what statutory refraction slab was applied for quality deduction?',
        question_hi: 'मेरी तौल पर्ची पर प्रमाणित नमी कितनी दर्ज थी, और गुणवत्ता कटौती हेतु कौन सा वैधानिक स्लैब लागू किया गया?',
      },
      {
        id: 'q3',
        category: 'society_recovery',
        target_authority: 'PACS Society Secretary / DCCB Branch',
        statutory_reference: 'State Cooperative Societies Act & KCC Recovery Scroll',
        question_en: 'If any deduction was withheld towards PACS crop loan recovery, could you provide the loan credit deposit scroll and updated KCC balance?',
        question_hi: 'यदि समिति ऋण वसूली हेतु राशि रोकी गई है, तो क्या सहकारी बैंक की ऋण जमा रसीद और अद्यतन केसीसी खाता विवरण दिया जा सकता है?',
      },
      {
        id: 'q4',
        category: 'unexplained_difference',
        target_authority: 'District Food & Civil Supplies Officer',
        statutory_reference: 'e-Uparjan Procurement Settlement Rules',
        question_en: 'There is an unexplained variance of ₹3,475.00 on my procurement settlement. Could you provide the itemized J-Form deduction scroll clarifying this variance?',
        question_hi: 'उपार्जन भुगतान में ₹3,475.00 का कोई स्पष्ट विवरण नहीं है। क्या इस अंतर को स्पष्ट करने वाला विस्तृत जे-फॉर्म विवरण दिया जा सकता है?',
      },
    ],
  });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await verifyMspApi({
        crop,
        quantity_quintals: quantity,
        msp_rate: mspRate,
        actual_payment: actualPayment,
        procurement_center: procurementCenter,
        farmer_id: farmer.farmerId,
      });

      setResult(res);

      if (res.status === 'Verified') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#4E6E3D', '#698E59', '#FAF8F2'],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleDiscrepancy = () => {
    setQuantity(50);
    setMspRate(2300);
    setActualPayment(105000);
    setResult(null);
  };

  const loadSampleMatch = () => {
    setQuantity(50);
    setMspRate(2300);
    setActualPayment(115000);
    setResult(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/farmer')}
            className="w-10 h-10 rounded-2xl bg-white border border-warm-border flex items-center justify-center text-gray-700 hover:bg-sage-50 transition-colors shadow-soft"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {language === 'hi' ? 'एमएसपी और भुगतान स्थिति' : 'MSP & Payment Status'}
            </h1>
            <p className="text-xs text-gray-500">
              Verify Minimum Support Price crop procurement payments
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={loadSampleDiscrepancy}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-kisan-lightred text-kisan-red border border-kisan-red/30 hover:bg-red-100 transition-colors"
          >
            Load ₹10k Difference
          </button>
          <button
            onClick={loadSampleMatch}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-sage-100 text-sage-800 border border-sage-300 hover:bg-sage-200 transition-colors"
          >
            Load Full MSP Match
          </button>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-warm-border pb-1">
        <button
          onClick={() => setActiveTab('verify')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'verify'
              ? 'bg-forest text-white shadow-soft'
              : 'bg-white text-charcoal/70 hover:bg-tint/40 border border-warm-border/70'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{language === 'hi' ? 'उपार्जन एवं भुगतान सत्यापन' : 'Verify Procurement & Payment'}</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'timeline'
              ? 'bg-forest text-white shadow-soft'
              : 'bg-white text-charcoal/70 hover:bg-tint/40 border border-warm-border/70'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{language === 'hi' ? 'उपार्जन समयरेखा एवं स्थिति' : 'Procurement Timeline & Status'}</span>
        </button>
      </div>

      {activeTab === 'timeline' ? (
        <MSPTimelineView recordRef={recordId || 'MSP-2024-4411'} />
      ) : (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form */}
        <div className="lg:col-span-7 bg-cream-surface rounded-2xl p-5 sm:p-7 border border-warm-border shadow-soft space-y-4">
          <div className="border-b border-warm-border pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-charcoal">
                Crop Procurement Information
              </h2>
              <p className="text-xs text-muted">
                Formula: Expected = Quantity (qtl) × MSP Rate (₹/qtl)
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-tint text-forest flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                Crop Variety
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
              >
                <option value="Paddy (Common)">Paddy Common (₹2,300/qtl)</option>
                <option value="Paddy (Grade A)">Paddy Grade A (₹2,320/qtl)</option>
                <option value="Wheat">Wheat (₹2,275/qtl)</option>
                <option value="Maize">Maize (₹2,225/qtl)</option>
                <option value="Soybean">Soybean (₹4,892/qtl)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  Procured Quantity (Quintals)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-bold text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  MSP Rate per Quintal (₹)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  step="1"
                  value={mspRate}
                  onChange={(e) => setMspRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-bold text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                Actual Payment Received in Bank (₹)
              </label>
              <input
                type="number"
                inputMode="numeric"
                step="100"
                value={actualPayment}
                onChange={(e) => setActualPayment(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-bold text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                Mandi / Procurement Center
              </label>
              <input
                type="text"
                value={procurementCenter}
                onChange={(e) => setProcurementCenter(e.target.value)}
                className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] py-3.5 px-6 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-sm shadow-soft flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Computing MSP entitlement...</span>
                ) : (
                  <>
                    <span>Verify MSP Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Result Pane (Matches mockup screenshot) */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-warm-border shadow-card space-y-5 animate-in fade-in duration-300">
              
              {/* Paddy badge header */}
              <div className="p-4 rounded-2xl bg-warm-card border border-warm-border flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{result.crop}</h3>
                  <p className="text-xs text-gray-500">{result.quantity_quintals} Quintals</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-400 uppercase font-semibold">MSP Rate</p>
                  <p className="text-sm font-bold text-sage-800">₹{result.msp_rate}/qtl</p>
                </div>
              </div>

              {/* Expected vs Actual 2-Col Card */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-warm-bg border border-warm-border">
                  <p className="text-xs text-gray-500 mb-1">Expected Payment</p>
                  <p className="text-lg font-extrabold text-gray-900">
                    ₹{result.expected_payment.toLocaleString()}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-warm-bg border border-warm-border">
                  <p className="text-xs text-gray-500 mb-1">Actual Payment</p>
                  <p className="text-lg font-extrabold text-gray-900">
                    ₹{result.actual_payment.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Discrepancy Alert */}
              {result.is_flagged ? (
                <div className="p-4 rounded-2xl bg-kisan-lightred border border-kisan-red/25 space-y-1">
                  <div className="flex items-center gap-2 text-kisan-red font-bold text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Payment Discrepancy Detected!</span>
                  </div>
                  <p className="text-xs font-extrabold text-kisan-red">
                    Difference: ₹{result.difference.toLocaleString()}
                  </p>
                  <p className="text-xs text-red-800 leading-relaxed pt-1">
                    {result.explanation}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#EDF7ED] border border-[#C8E6C9] space-y-1">
                  <div className="flex items-center gap-2 text-[#2E7D32] font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Payment Matches Statutory MSP</span>
                  </div>
                  <p className="text-xs text-green-800 leading-relaxed pt-1">
                    {result.explanation}
                  </p>
                </div>
              )}

              {/* Basis of this check card */}
              <BasisOfCheckCard
                checkType="msp"
                sources={result.sources}
                flaggedRuleCode={result.flagged_rule_code}
                flaggedRuleThreshold={result.flagged_rule_threshold}
                flaggedRuleReasonEn={result.flagged_rule_reason_en}
                flaggedRuleReasonHi={result.flagged_rule_reason_hi}
                isFlagged={result.is_flagged}
                arithmetic={{
                  crop: result.crop,
                  quantity: result.quantity_quintals,
                  rate: result.msp_rate,
                  expected: result.expected_payment,
                  actual: result.actual_payment,
                  difference: result.difference,
                }}
              />

              {/* Reasons */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Possible reasons
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  {(result.reasons || result.possible_reasons || []).map((r: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage-600 mt-1.5 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Spoken Audio Summary Player */}
              <AudioSummaryPlayer
                checkType="msp"
                crop={result.crop}
                quantity={result.quantity_quintals}
                rate={result.msp_rate}
                expectedPayment={result.expected_payment}
                actualPayment={result.actual_payment}
                difference={result.difference}
                procurementCenter={procurementCenter}
                autoPlayAllowed={true}
              />

              {/* Action buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className="w-full py-2.5 px-4 rounded-2xl bg-tint/60 border border-forest/30 hover:bg-tint text-forest font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'उपार्जन से भुगतान समयरेखा देखें' : 'View Procurement-to-Payment Timeline'}</span>
                </button>

                <button
                  onClick={() => navigate('/farmer/reports')}
                  className="w-full py-3.5 px-6 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-sm shadow-card flex items-center justify-center gap-2 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download MSP Report</span>
                </button>

                {result.is_flagged && (
                  <button
                    onClick={() => navigate('/farmer/grievance')}
                    className="w-full py-3 px-6 rounded-2xl bg-white border border-warm-border hover:bg-warm-bg text-gray-800 font-semibold text-sm shadow-soft flex items-center justify-center gap-2 transition-all"
                  >
                    <HelpCircle className="w-4 h-4 text-kisan-red" />
                    <span>Raise a Complaint</span>
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-warm-border text-center flex flex-col items-center justify-center min-h-[360px] text-gray-400">
              <div className="w-16 h-16 rounded-full bg-sage-50 text-sage-600 flex items-center justify-center mb-3">
                <Coins className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-bold text-gray-700 mb-1">
                MSP Calculator Ready
              </h3>
              <p className="text-xs max-w-xs leading-relaxed text-gray-500">
                Click <strong>"Verify MSP Payment"</strong> to compare expected rate against received payment.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Itemized Deductions & Unexplained Difference Card */}
      {result && result.adjustments && result.adjustments.length > 0 && (
        <MSPAdjustmentsBreakdownCard
          grossExpected={result.gross_expected || result.expected_payment}
          actualPayment={result.actual_payment}
          totalDifference={result.difference}
          totalExplained={result.total_explained_adjustments || 0}
          unexplainedDifference={result.unexplained_difference || 0}
          adjustments={result.adjustments}
          questionsToAsk={result.questions_to_ask || []}
          crop={result.crop}
        />
      )}
      </>
      )}

    </div>
  );
};
