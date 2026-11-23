import React, { useState } from 'react';
import { Download, FileText, Filter, Calendar, Search, Building2, Loader2, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { downloadReportPdfApi } from '../services/api';
import { apiClient } from '../lib/api';

export const AdminReportsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const bankReports = [
    {
      id: 'REP-AUDIT-2025-01',
      title: 'Branch Portfolio Discrepancy Audit - Durg Main',
      period: 'January 2025 - March 2025',
      branch: 'Durg Main Branch',
      totalCases: 42,
      resolved: 38,
      pending: 4,
      generatedDate: '24 Mar 2025',
      type: 'Audit Report',
      status: 'Verified'
    },
    {
      id: 'REP-KCC-RECON-89',
      title: 'Kisan Credit Card (KCC) Processing & Deduction Reconciliation',
      period: 'FY 2024-25 Q4',
      branch: 'Patan Rural Branch',
      totalCases: 29,
      resolved: 24,
      pending: 5,
      generatedDate: '20 Mar 2025',
      type: 'Reconciliation',
      status: 'Needs Review'
    },
    {
      id: 'REP-PMFBY-CLAIM-04',
      title: 'Crop Insurance (PMFBY) Payout Verification Summary',
      period: 'Kharif 2024 Season',
      branch: 'Bhilai Agriculture Wing',
      totalCases: 64,
      resolved: 61,
      pending: 3,
      generatedDate: '15 Mar 2025',
      type: 'Insurance Claims',
      status: 'Verified'
    },
    {
      id: 'REP-MSP-MANDI-12',
      title: 'Direct Mandi MSP Payment Difference Log - Paddy Lot #4',
      period: 'December 2024 - February 2025',
      branch: 'Durg Mandi Samiti',
      totalCases: 51,
      resolved: 47,
      pending: 4,
      generatedDate: '02 Mar 2025',
      type: 'MSP Payout',
      status: 'Needs Review'
    }
  ];

  const filteredReports = bankReports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === 'All' || r.branch.includes(selectedBranch);
    return matchesSearch && matchesBranch;
  });

  const handleDownload = async (reportId: string) => {
    setDownloadingId(reportId);
    setErrorToast(null);
    try {
      // Connects to /api/v1/reports/download/REP-LN-2025-01 via shared API client
      const targetRef = 'REP-LN-2025-01';
      const blob = await downloadReportPdfApi(targetRef);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportId}_Audit_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('PDF download error:', err);
      setErrorToast(`Failed to download report (${err.message || 'Network error'}). Please try again.`);
      setTimeout(() => setErrorToast(null), 5000);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Toast */}
      {errorToast && (
        <div className="bg-status-discrepancy border border-red-200 text-status-discrepancy-text p-4 rounded-2xl flex items-center justify-between shadow-soft animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorToast}</span>
          </div>
          <button
            onClick={() => setErrorToast(null)}
            className="text-status-discrepancy-text/80 hover:text-status-discrepancy-text text-xs font-semibold px-2 py-1 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-forest" />
            Bank & Institutional Audit Reports
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Official reconciliation logs, branch audit summaries, and automated compliance records.
          </p>
        </div>

        <button
          onClick={async () => {
            try {
              await apiClient.download('/admin/export-csv', 'KisanVerify_Reconciliation_Cases.csv');
            } catch (err) {
              console.error('Export error:', err);
            }
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-olive hover:bg-forest text-white font-semibold text-xs sm:text-sm rounded-xl shadow-soft transition-all"
        >
          <Download className="w-4 h-4" />
          Export All Reconciliation CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-cream-surface p-3.5 sm:p-4 rounded-2xl border border-warm-border shadow-card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted" />
          <input
            type="text"
            placeholder="Search report by ID or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-cream border border-warm-border rounded-xl text-charcoal focus:outline-none focus:ring-2 focus:ring-olive"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-charcoal-muted" />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 text-xs border border-warm-border rounded-xl bg-cream text-charcoal font-semibold focus:outline-none focus:ring-2 focus:ring-olive"
          >
            <option value="All">All Branches</option>
            <option value="Durg">Durg Main</option>
            <option value="Patan">Patan Rural</option>
            <option value="Bhilai">Bhilai Agriculture</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-cream-surface rounded-2xl border border-warm-border p-5 shadow-card hover:border-olive/40 transition-colors">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-tint border border-forest/10 flex items-center justify-center text-forest">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-forest bg-tint px-2 py-0.5 rounded-md">
                    {report.id}
                  </span>
                  <div className="text-xs text-charcoal-muted mt-0.5">{report.branch}</div>
                </div>
              </div>
              <StatusBadge status={report.status as any} size="sm" />
            </div>

            <h3 className="text-sm sm:text-base font-bold text-charcoal mb-2 leading-snug">
              {report.title}
            </h3>

            <div className="bg-cream rounded-xl p-3 text-xs text-charcoal mb-4 grid grid-cols-3 gap-2 text-center border border-warm-border">
              <div>
                <div className="text-charcoal-muted font-medium text-[10px] uppercase">Cases</div>
                <div className="text-sm font-bold text-charcoal">{report.totalCases}</div>
              </div>
              <div>
                <div className="text-charcoal-muted font-medium text-[10px] uppercase">Resolved</div>
                <div className="text-sm font-bold text-status-eligible-text">{report.resolved}</div>
              </div>
              <div>
                <div className="text-charcoal-muted font-medium text-[10px] uppercase">Pending</div>
                <div className="text-sm font-bold text-status-review-text">{report.pending}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-warm-border text-xs text-charcoal-muted">
              <span className="flex items-center gap-1 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-charcoal-muted" />
                Generated on {report.generatedDate}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(report.id)}
                  disabled={downloadingId === report.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-tint hover:bg-olive hover:text-white disabled:opacity-50 text-forest font-semibold rounded-xl border border-forest/15 transition-colors text-xs shadow-soft"
                >
                  {downloadingId === report.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      PDF Audit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
