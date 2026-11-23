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
  Loader2
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

  const [filterPeriod, setFilterPeriod] = useState('Last 6 Months');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const initialReports: ReportItem[] = [
    {
      id: 'REP-LN-2025-01',
      title: 'Loan Verification Report',
      titleHi: 'ऋण सत्यापन रिपोर्ट',
      reportType: 'Loan Verification',
      referenceId: 'Loan ID: LN12345',
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
      referenceId: 'Crop: Paddy',
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

  const handleDownload = async (report: ReportItem) => {
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Header & Desktop Controls (Image A) */}
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
              {language === 'hi' ? 'मेरी वित्तीय रिपोर्टें' : 'My Reports'}
            </h1>
            <p className="text-xs text-muted">
              View and download your financial and verification reports.
            </p>
          </div>
        </div>

        {/* Desktop Filter & Download All (Image A) */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="px-3 py-2 bg-cream-surface rounded-xl border border-warm-border text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-olive shadow-soft min-h-[40px] cursor-pointer"
          >
            <option value="Last 6 Months">Last 6 Months</option>
            <option value="Current Financial Year">Current FY 2024-25</option>
            <option value="All Reports">All Reports</option>
          </select>

          <button
            onClick={handleDownloadAll}
            className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-bold shadow-soft flex items-center gap-1.5 transition-all active:scale-95 min-h-[40px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All</span>
          </button>
        </div>
      </div>

      {/* Reports List (Matching Image A & Image B) */}
      <div className="space-y-3">
        {initialReports.map((report) => (
          <div
            key={report.id}
            className="bg-cream-surface rounded-2xl p-4 sm:p-5 border border-warm-border shadow-soft flex items-center justify-between gap-4 hover:border-olive transition-all group"
          >
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              {/* Tinted icon container */}
              <div className="w-11 h-11 rounded-xl bg-tint flex items-center justify-center shrink-0 shadow-soft">
                {getReportIcon(report.reportType)}
              </div>

              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-charcoal truncate group-hover:text-forest transition-colors">
                  {language === 'hi' ? report.titleHi : report.title}
                </h3>
                <p className="text-xs text-muted truncate mt-0.5">
                  <span>{report.date}</span>
                  <span className="mx-1.5">•</span>
                  <span>{report.referenceId}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge status={report.status} size="sm" />

              <button
                onClick={() => handleDownload(report)}
                disabled={downloadingId === report.id}
                className="w-10 h-10 rounded-xl bg-cream border border-warm-border hover:bg-tint text-charcoal flex items-center justify-center shadow-soft transition-all active:scale-95 disabled:opacity-50"
                aria-label={`Download ${report.title}`}
                title="Download Official PDF"
              >
                {downloadingId === report.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-forest" />
                ) : (
                  <Download className="w-4 h-4 text-forest" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
