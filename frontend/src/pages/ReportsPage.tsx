import React, { useState, useEffect } from 'react';
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
  Share2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { ReportItem } from '../types';

export const ReportsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  const [filterPeriod, setFilterPeriod] = useState('Last 6 Months');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const initialReports: ReportItem[] = [
    {
      id: 'REP-LN-2025-01',
      title: 'Loan Verification Report',
      titleHi: 'ऋण सत्यापन रिपोर्ट',
      reportType: 'Loan Verification',
      referenceId: 'LN: LN12345',
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
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    try {
      const response = await fetch(`${API_BASE}${report.downloadUrl}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.id}_${report.reportType.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('API download failed, fallback to print view');
      }
    } catch (err) {
      console.warn('Direct PDF download failed, opening browser print view', err);
      // Fallback: Trigger instant window print / save-as-pdf
      setSelectedReport(report);
      setTimeout(() => {
        window.print();
      }, 300);
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/farmer')}
            className="w-10 h-10 rounded-2xl bg-white border border-warm-border flex items-center justify-center text-gray-700 hover:bg-sage-50 transition-colors shadow-soft"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {language === 'hi' ? 'मेरी रिपोर्ट्स' : 'My Reports'}
            </h1>
            <p className="text-xs text-gray-500">
              View and download your financial and verification reports
            </p>
          </div>
        </div>

        {/* Filter & Download All Buttons (Matching mockup) */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-warm-border text-xs font-semibold text-gray-700 shadow-soft">
            <Filter className="w-3.5 h-3.5 text-sage-600" />
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="Current Financial Year">Current FY 2024-25</option>
              <option value="All Time">All Time</option>
            </select>
          </div>

          <button
            onClick={handleDownloadAll}
            className="px-4 py-2 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-semibold shadow-soft flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All</span>
          </button>
        </div>
      </div>

      {/* Reports List Cards (Matching the design layout) */}
      <div className="space-y-3.5">
        {initialReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-3xl p-4 sm:p-5 border border-warm-border hover:border-sage-400 hover:shadow-card transition-all flex items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-3.5">
              {/* Document Icon badge */}
              <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center shrink-0 group-hover:bg-sage-600 group-hover:text-white transition-colors shadow-soft">
                <FileText className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-sage-700 transition-colors">
                  {language === 'hi' ? report.titleHi : report.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span>{report.date}</span>
                  <span>•</span>
                  <span className="font-mono text-gray-600">{report.referenceId}</span>
                  <span>•</span>
                  <span className="text-[11px] text-gray-400">{report.fileSize}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge status={report.status} size="sm" />
              
              {/* View Preview button */}
              <button
                onClick={() => setSelectedReport(report)}
                className="w-9 h-9 rounded-xl bg-warm-bg border border-warm-border flex items-center justify-center text-gray-600 hover:text-sage-700 hover:bg-sage-50 transition-colors"
                title="Preview Report"
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Download PDF button */}
              <button
                onClick={() => handleDownload(report)}
                disabled={downloadingId === report.id}
                className="w-9 h-9 rounded-xl bg-sage-50 border border-sage-200 flex items-center justify-center text-sage-800 hover:bg-sage-600 hover:text-white hover:border-sage-600 transition-colors shadow-soft disabled:opacity-50"
                title="Download PDF Report"
              >
                <Download className={`w-4 h-4 ${downloadingId === report.id ? 'animate-bounce' : ''}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-warm-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sage-700">
                  {selectedReport.id}
                </span>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedReport.title}
                </h3>
                <p className="text-xs text-gray-500">{selectedReport.date} • {selectedReport.referenceId}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Details */}
            <div className="space-y-3 text-xs text-gray-700">
              <div className="p-3 rounded-2xl bg-warm-bg border border-warm-border flex items-center justify-between">
                <span>Beneficiary:</span>
                <strong>{farmer.name} (ID: {farmer.farmerId})</strong>
              </div>
              <div className="p-3 rounded-2xl bg-warm-bg border border-warm-border flex items-center justify-between">
                <span>Location:</span>
                <span>{farmer.village}, {farmer.district}, {farmer.state}</span>
              </div>
              <div className="p-3 rounded-2xl bg-warm-bg border border-warm-border flex items-center justify-between">
                <span>Verification State:</span>
                <StatusBadge status={selectedReport.status} size="sm" />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200 text-xs text-sage-900 leading-relaxed">
              <strong>Report Summary:</strong> Official formal statement containing deterministic reconciliation tables, bank sanction references, and procedural notes.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleDownload(selectedReport)}
                className="flex-1 py-3 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-xs shadow-soft flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
