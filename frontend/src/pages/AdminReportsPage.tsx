import React, { useState } from 'react';
import { Download, FileText, Filter, Calendar, Search, CheckCircle2, AlertTriangle, Building2, Eye } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const AdminReportsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');

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
      status: 'Possible Discrepancy'
    }
  ];

  const filteredReports = bankReports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === 'All' || r.branch.includes(selectedBranch);
    return matchesSearch && matchesBranch;
  });

  const handleDownload = (id: string) => {
    // Triggers download from API or fallback dummy file
    window.open(`http://localhost:8000/api/v1/reports/pdf/REP-2025-0891`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary-700" />
            Bank & Institutional Audit Reports
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Official reconciliation logs, branch audit summaries, and automated compliance records.
          </p>
        </div>

        <button
          onClick={() => window.open('http://localhost:8000/api/v1/admin/export-cases?format=csv', '_blank')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-medium text-sm rounded-lg shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          Export All Reconciliation CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search report by ID or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
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
          <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                    {report.id}
                  </span>
                  <div className="text-xs text-gray-500 mt-0.5">{report.branch}</div>
                </div>
              </div>
              <StatusBadge status={report.status as any} />
            </div>

            <h3 className="text-base font-semibold text-gray-900 mb-2 leading-snug">
              {report.title}
            </h3>

            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 mb-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-gray-400 font-medium">Cases</div>
                <div className="text-sm font-bold text-gray-900">{report.totalCases}</div>
              </div>
              <div>
                <div className="text-gray-400 font-medium">Resolved</div>
                <div className="text-sm font-bold text-emerald-700">{report.resolved}</div>
              </div>
              <div>
                <div className="text-gray-400 font-medium">Pending</div>
                <div className="text-sm font-bold text-amber-700">{report.pending}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Generated on {report.generatedDate}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(report.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-800 font-medium rounded-lg border border-primary-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF Audit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
