import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Eye, 
  X, 
  FileCheck, 
  Share2, 
  Coins, 
  ShieldCheck, 
  Layers, 
  Loader2,
  Search,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { ReportItem } from '../types';
import { apiClient } from '../lib/api';

export const ReportsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  const isHi = language === 'hi';
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'loan' | 'msp' | 'insurance' | 'scheme'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('Last 6 Months');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const initialReports: ReportItem[] = [
    {
      id: 'REP-LN-2025-01',
      title: 'Loan Verification Report',
      titleHi: 'ऋण सत्यापन रिपोर्ट',
      reportType: 'Loan Verification',
      referenceId: 'Loan ID: LN-2024-8812',
      date: '12 Apr 2025',
      status: 'Needs Review',
      fileSize: '1.2 MB',
      downloadUrl: '/api/v1/reports/download/REP-LN-2025-01',
    },
    {
      id: 'REP-MSP-2025-02',
      title: 'MSP Payment Report',
      titleHi: 'एमएसपी भुगतान रिपोर्ट',
      reportType: 'MSP Payment',
      referenceId: 'Crop: Paddy (Common)',
      date: '05 Apr 2025',
      status: 'Verified',
      fileSize: '950 KB',
      downloadUrl: '/api/v1/reports/download/REP-MSP-2025-02',
    },
    {
      id: 'REP-INS-2025-03',
      title: 'Insurance Claim Report',
      titleHi: 'फसल बीमा दावा रिपोर्ट',
      reportType: 'Insurance Claim',
      referenceId: 'Claim ID: CI20251234',
      date: '28 Mar 2025',
      status: 'Under Review',
      fileSize: '1.4 MB',
      downloadUrl: '/api/v1/reports/download/REP-INS-2025-03',
    },
    {
      id: 'REP-SCH-2025-04',
      title: 'Scheme Eligibility Report',
      titleHi: 'योजना पात्रता रिपोर्ट',
      reportType: 'Scheme Eligibility',
      referenceId: 'State: Chhattisgarh',
      date: '20 Mar 2025',
      status: 'Verified',
      fileSize: '800 KB',
      downloadUrl: '/api/v1/reports/download/REP-SCH-2025-04',
    },
  ];

  const filteredReports = initialReports.filter((report) => {
    // Category filter
    if (selectedCategory === 'loan' && !report.reportType.toLowerCase().includes('loan')) return false;
    if (selectedCategory === 'msp' && !report.reportType.toLowerCase().includes('msp')) return false;
    if (selectedCategory === 'insurance' && !report.reportType.toLowerCase().includes('insurance')) return false;
    if (selectedCategory === 'scheme' && !report.reportType.toLowerCase().includes('scheme')) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = report.title.toLowerCase().includes(q) || (report.titleHi && report.titleHi.toLowerCase().includes(q));
      const matchRef = report.id.toLowerCase().includes(q) || report.referenceId.toLowerCase().includes(q);
      if (!matchTitle && !matchRef) return false;
    }

    return true;
  });

  const handleDownload = async (report: ReportItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloadingId(report.id);
    try {
      const filename = `${report.id}_${report.reportType.replace(/\s+/g, '_')}.pdf`;
      const downloadPath = report.downloadUrl || `/reports/download/${report.id}`;
      await apiClient.download(downloadPath, filename);
    } catch (err) {
      console.warn('PDF download fallback', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAll = () => {
    initialReports.forEach((rep, idx) => {
      setTimeout(() => {
        handleDownload(rep);
      }, idx * 600);
    });
  };

  const getReportIcon = (type: string) => {
    if (type.includes('Loan')) return <FileText className="w-5 h-5 text-forest" strokeWidth={1.75} />;
    if (type.includes('MSP')) return <Coins className="w-5 h-5 text-forest" strokeWidth={1.75} />;
    if (type.includes('Insurance')) return <ShieldCheck className="w-5 h-5 text-forest" strokeWidth={1.75} />;
    return <Layers className="w-5 h-5 text-forest" strokeWidth={1.75} />;
  };

  const categories = [
    { id: 'all', label: 'All Reports', labelHi: 'सभी रिपोर्टें' },
    { id: 'loan', label: 'Loan Verification', labelHi: 'ऋण सत्यापन' },
    { id: 'msp', label: 'MSP Payments', labelHi: 'एमएसपी भुगतान' },
    { id: 'insurance', label: 'Crop Insurance', labelHi: 'फसल बीमा' },
    { id: 'scheme', label: 'Schemes', labelHi: 'योजनाएं' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Header & Desktop Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate('/farmer')}
            className="w-9 h-9 rounded-full bg-cream-surface border border-warm-border flex items-center justify-center text-charcoal hover:bg-tint transition-colors shadow-soft"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-charcoal tracking-tight">
              {isHi ? 'मेरी वित्तीय रिपोर्टें' : 'My Reports'}
            </h1>
            <p className="text-xs text-muted">
              {isHi ? 'विस्तृत वित्तीय मिलान रिपोर्टें एवं आधिकारिक स्रोत देखें' : 'View and download detailed financial reconciliation reports.'}
            </p>
          </div>
        </div>

        {/* Desktop Filter & Download All */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="px-3 py-2 bg-cream-surface rounded-xl border border-warm-border text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-olive shadow-soft min-h-[40px] cursor-pointer"
          >
            <option value="Last 6 Months">{isHi ? 'पिछले 6 महीने' : 'Last 6 Months'}</option>
            <option value="Current Financial Year">{isHi ? 'चालू वित्त वर्ष 2024-25' : 'Current FY 2024-25'}</option>
            <option value="All Reports">{isHi ? 'सभी रिपोर्टें' : 'All Reports'}</option>
          </select>

          <button
            onClick={handleDownloadAll}
            className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-bold shadow-soft flex items-center gap-1.5 transition-all active:scale-95 min-h-[40px] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isHi ? 'सभी डाउनलोड करें' : 'Download All'}</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills & Search Bar */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-forest text-white shadow-soft'
                  : 'bg-cream-surface border border-warm-border text-charcoal hover:bg-tint'
              }`}
            >
              {isHi ? cat.labelHi : cat.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHi ? 'रिपोर्ट का नाम, आईडी या फसल खोजें...' : 'Search reports by title, ID, crop, or reference...'}
            className="w-full pl-9 pr-4 py-2 bg-cream-surface rounded-xl border border-warm-border text-xs text-charcoal placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-olive transition-colors min-h-[40px]"
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => navigate(`/farmer/reports/${report.id}`)}
              className="bg-cream-surface rounded-2xl p-4 sm:p-5 border border-warm-border shadow-soft flex items-center justify-between gap-4 hover:border-olive transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                {/* Tinted icon container */}
                <div className="w-11 h-11 rounded-xl bg-tint flex items-center justify-center shrink-0 shadow-soft">
                  {getReportIcon(report.reportType)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-charcoal truncate group-hover:text-forest transition-colors">
                      {isHi ? report.titleHi : report.title}
                    </h3>
                    <span className="text-[10px] font-mono text-muted uppercase bg-cream px-1.5 py-0.5 rounded border border-warm-border/60">
                      {report.id}
                    </span>
                  </div>
                  <p className="text-xs text-muted truncate mt-0.5">
                    <span>{report.date}</span>
                    <span className="mx-1.5">•</span>
                    <span>{report.referenceId}</span>
                    <span className="mx-1.5">•</span>
                    <span>{report.fileSize}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={report.status} size="sm" />

                <button
                  type="button"
                  onClick={(e) => handleDownload(report, e)}
                  disabled={downloadingId === report.id}
                  className="w-10 h-10 rounded-xl bg-cream border border-warm-border hover:bg-tint text-charcoal flex items-center justify-center shadow-soft transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  aria-label={`Download ${report.title}`}
                  title="Download Official PDF"
                >
                  {downloadingId === report.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-forest" />
                  ) : (
                    <Download className="w-4 h-4 text-forest" />
                  )}
                </button>

                <ChevronRight className="w-4 h-4 text-muted group-hover:text-forest transition-colors hidden sm:block" />
              </div>
            </div>
          ))
        ) : (
          <div className="bg-cream-surface rounded-2xl p-8 border border-dashed border-warm-border text-center space-y-2 text-muted">
            <Layers className="w-10 h-10 text-muted/50 mx-auto" />
            <h4 className="text-sm font-bold text-charcoal">
              {isHi ? 'कोई रिपोर्ट नहीं मिली' : 'No reports found'}
            </h4>
            <p className="text-xs max-w-xs mx-auto">
              {isHi ? 'अपनी खोज या फ़िल्टर मानदंड बदलकर पुनः प्रयास करें।' : 'Try adjusting your search query or category filter.'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

