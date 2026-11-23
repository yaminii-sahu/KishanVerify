import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquareWarning, 
  Search, 
  Download, 
  Eye, 
  X,
  TrendingUp, 
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { StatusBadge } from '../components/StatusBadge';
import { AdminCase, AdminStats } from '../types';
import { apiClient } from '../lib/api';

export const AdminDashboardPage: React.FC = () => {
  const { selectedDistrict } = useOutletContext<{ selectedDistrict: string }>();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats>({
    totalRecords: selectedDistrict === 'All' ? 2480 : 1248,
    verifiedCount: selectedDistrict === 'All' ? 2180 : 1102,
    discrepanciesCount: selectedDistrict === 'All' ? 300 : 146,
    pendingComplaints: selectedDistrict === 'All' ? 125 : 32,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCase, setSelectedCase] = useState<AdminCase | null>(null);

  // Pre-seeded cases matching blueprint and Image A table
  const [cases, setCases] = useState<AdminCase[]>([
    {
      id: 'CASE-LN-1',
      farmerName: 'Ramesh Kumar',
      farmerId: 'FV12345',
      district: 'Durg',
      recordType: 'Loan',
      expectedAmount: 80000,
      actualAmount: 70000,
      difference: 10000,
      status: 'Needs Review',
      date: '12-03-2024',
      notes: 'Approved ₹80,000, disbursed ₹70,000. Deductions of ₹5,000 for fees/insurance recorded.',
    },
    {
      id: 'CASE-MSP-2',
      farmerName: 'Sita Devi',
      farmerId: 'FV67890',
      district: 'Durg',
      recordType: 'MSP',
      expectedAmount: 115000,
      actualAmount: 115000,
      difference: 0,
      status: 'Verified',
      date: '14-04-2024',
      notes: '50 quintals paddy @ ₹2,300 statutory MSP credited in full.',
    },
    {
      id: 'CASE-INS-3',
      farmerName: 'Mohan Lal',
      farmerId: 'FV54321',
      district: 'Durg',
      recordType: 'Insurance',
      expectedAmount: 30000,
      actualAmount: 20000,
      difference: 10000,
      status: 'Needs Review',
      date: '15-02-2024',
      notes: 'Wheat crop insurance claim: CCE assessment pending second tranche release.',
    },
    {
      id: 'CASE-LN-4',
      farmerName: 'Sunita Bai',
      farmerId: 'FV99887',
      district: 'Dhamtari',
      recordType: 'Loan',
      expectedAmount: 50000,
      actualAmount: 50000,
      difference: 0,
      status: 'Verified',
      date: '18-05-2024',
      notes: 'KCC short-term cultivation loan verified in full.',
    },
    {
      id: 'CASE-MSP-5',
      farmerName: 'Ramesh Kumar',
      farmerId: 'FV12345',
      district: 'Durg',
      recordType: 'MSP',
      expectedAmount: 115000,
      actualAmount: 105000,
      difference: 10000,
      status: 'Needs Review',
      date: '05-04-2024',
      notes: 'Patan Mandi paddy procurement: ₹10,000 moisture/grade deduction flagged.',
    },
  ]);

  // Analytics Chart Data
  const districtChartData = [
    { name: 'Durg', verified: 1102, discrepancies: 146 },
    { name: 'Raipur', verified: 480, discrepancies: 62 },
    { name: 'Bilaspur', verified: 340, discrepancies: 51 },
    { name: 'Rajnandgaon', verified: 158, discrepancies: 24 },
    { name: 'Dhamtari', verified: 100, discrepancies: 17 },
  ];

  const typePieData = [
    { name: 'Loan Deductions', value: 45, color: '#4A6538' },
    { name: 'MSP Differences', value: 35, color: '#D97706' },
    { name: 'Insurance Claims', value: 20, color: '#2563EB' },
  ];

  // Filter cases based on search, status, and district
  const filteredCases = cases.filter((c) => {
    if (selectedDistrict !== 'All' && c.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
      return false;
    }
    if (statusFilter !== 'All' && c.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.farmerName.toLowerCase().includes(q) ||
        c.farmerId.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleResolveCase = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: 'Verified' as const } : c))
    );
    if (selectedCase) {
      setSelectedCase({ ...selectedCase, status: 'Verified' });
    }
  };

  const handleExportCSV = async () => {
    try {
      await apiClient.download(
        `/admin/export-csv?district=${encodeURIComponent(selectedDistrict)}`,
        `KisanVerify_Cases_${selectedDistrict || 'All'}.csv`
      );
    } catch (err) {
      console.error('Export CSV error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header matching Image A */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-charcoal tracking-tight">
          Bank / Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
          Monitor records, verify discrepancies and resolve cases.
        </p>
      </div>
      
      {/* 4 Stat Cards: 4 cols on desktop, 2x2 on phone/tablet */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Records */}
        <div className="bg-cream-surface rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-warm-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1">
              Total Records
            </p>
            <h3 className="text-xl sm:text-3xl font-extrabold text-charcoal">
              {stats.totalRecords.toLocaleString()}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-charcoal-muted mt-0.5">Audited in database</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-tint text-forest flex items-center justify-center shadow-soft shrink-0">
            <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Verified */}
        <div className="bg-cream-surface rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-warm-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1">
              Verified
            </p>
            <h3 className="text-xl sm:text-3xl font-extrabold text-status-eligible-text">
              {stats.verifiedCount.toLocaleString()}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-status-eligible-text/90 mt-0.5">87.9% Match rate</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-status-eligible text-status-eligible-text flex items-center justify-center shadow-soft shrink-0">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Discrepancies */}
        <div className="bg-cream-surface rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-warm-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1">
              Discrepancies
            </p>
            <h3 className="text-xl sm:text-3xl font-extrabold text-status-discrepancy-text">
              {stats.discrepanciesCount}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-status-discrepancy-text/90 mt-0.5">Under investigation</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-status-discrepancy text-status-discrepancy-text flex items-center justify-center shadow-soft shrink-0">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Pending Complaints */}
        <div className="bg-cream-surface rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-warm-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1">
              Pending Complaints
            </p>
            <h3 className="text-xl sm:text-3xl font-extrabold text-status-review-text">
              {stats.pendingComplaints}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-status-review-text/90 mt-0.5">Awaiting reply</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-status-review text-status-review-text flex items-center justify-center shadow-soft shrink-0">
            <MessageSquareWarning className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

      </div>

      {/* Recent Cases Section */}
      <div className="bg-cream-surface rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-warm-border shadow-card space-y-4">
        
        {/* Table Controls matching Image A */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-border pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-charcoal tracking-tight">
              Recent Cases
            </h2>
            <p className="text-xs text-charcoal-muted">
              Review individual farmer loans, MSP and insurance reconciliations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search farmer..."
                className="pl-9 pr-4 py-2 bg-cream rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-olive w-full sm:w-56"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-cream rounded-xl border border-warm-border text-xs font-semibold text-charcoal focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Verified">Verified</option>
              <option value="Under Review">Under Review</option>
            </select>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-tint text-forest border border-forest/10 hover:bg-forest hover:text-white text-xs font-semibold shadow-soft transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Desktop / Tablet Table View (md+) matching Image A */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-warm-border text-charcoal-muted uppercase tracking-wider font-semibold text-[11px]">
                <th className="pb-3 pl-2">Farmer Name</th>
                <th className="pb-3">Record Type</th>
                <th className="pb-3 text-right">Expected</th>
                <th className="pb-3 text-right">Actual</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-border/60">
              {filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-cream/70 transition-colors group">
                  <td className="py-3.5 pl-2">
                    <div>
                      <p className="font-bold text-charcoal">{c.farmerName}</p>
                      <p className="text-[11px] font-mono text-charcoal-muted">{c.farmerId} • {c.district}</p>
                    </div>
                  </td>
                  <td className="py-3.5 font-medium text-charcoal">
                    <span className="px-2.5 py-0.5 rounded-lg bg-tint text-forest font-semibold text-[11px]">
                      {c.recordType}
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-semibold text-charcoal">
                    ₹{c.expectedAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 text-right font-semibold text-charcoal">
                    ₹{c.actualAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 text-center">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-3.5 text-right pr-2">
                    <button
                      onClick={() => setSelectedCase(c)}
                      className="px-3.5 py-1.5 rounded-xl bg-tint text-forest hover:bg-olive hover:text-white transition-all text-xs font-semibold shadow-soft"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Card View (< md) - Zero horizontal scroll on phones */}
        <div className="md:hidden space-y-3">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-2xl bg-cream border border-warm-border space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-charcoal">{c.farmerName}</h4>
                  <p className="text-[11px] text-charcoal-muted">{c.farmerId} • {c.district}</p>
                </div>
                <StatusBadge status={c.status} size="sm" />
              </div>

              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-cream-surface border border-warm-border text-center">
                <div>
                  <p className="text-[10px] text-charcoal-muted uppercase">Type</p>
                  <p className="text-xs font-bold text-forest">{c.recordType}</p>
                </div>
                <div>
                  <p className="text-[10px] text-charcoal-muted uppercase">Expected</p>
                  <p className="text-xs font-bold text-charcoal">₹{c.expectedAmount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-charcoal-muted uppercase">Actual</p>
                  <p className="text-xs font-bold text-charcoal">₹{c.actualAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {c.difference > 0 && (
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-charcoal-muted">Difference Flagged:</span>
                  <span className="font-bold text-status-discrepancy-text">₹{c.difference.toLocaleString('en-IN')}</span>
                </div>
              )}

              <button
                onClick={() => setSelectedCase(c)}
                className="w-full py-2 rounded-xl bg-tint text-forest font-semibold text-xs hover:bg-olive hover:text-white transition-colors flex items-center justify-center gap-1 shadow-soft"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Full Details</span>
              </button>
            </div>
          ))}

          {filteredCases.length === 0 && (
            <div className="text-center py-8 text-xs text-charcoal-muted">
              No matching cases found for the selected filter.
            </div>
          )}
        </div>

      </div>

      {/* Analytics Section with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* District Breakdown Bar Chart */}
        <div className="lg:col-span-7 bg-cream-surface rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-warm-border shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-warm-border pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-charcoal">
                Discrepancy Trends by District
              </h3>
              <p className="text-xs text-charcoal-muted">Verified matches vs records needing review</p>
            </div>
            <TrendingUp className="w-4 h-4 text-forest" />
          </div>

          <div className="h-60 sm:h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtChartData}>
                <XAxis dataKey="name" stroke="#6B7565" fontSize={11} />
                <YAxis stroke="#6B7565" fontSize={11} />
                <Tooltip />
                <Bar dataKey="verified" name="Verified Match" fill="#4A6538" radius={[6, 6, 0, 0]} />
                <Bar dataKey="discrepancies" name="Discrepancies" fill="#C0392B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Discrepancy Breakdown by Type Pie Chart */}
        <div className="lg:col-span-5 bg-cream-surface rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-warm-border shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-warm-border pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-charcoal">
                Discrepancies by Category
              </h3>
              <p className="text-xs text-charcoal-muted">Distribution across agricultural programs</p>
            </div>
            <Layers className="w-4 h-4 text-forest" />
          </div>

          <div className="h-60 sm:h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Case Review Modal: Responsive Bottom-Sheet on mobile, Centered Modal on desktop */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-cream-surface rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-warm-border space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-warm-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest">
                  {selectedCase.id}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-charcoal">
                  {selectedCase.farmerName} • {selectedCase.recordType} Case
                </h3>
                <p className="text-xs text-charcoal-muted">Farmer ID: {selectedCase.farmerId} • {selectedCase.district}</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="w-8 h-8 rounded-full bg-cream border border-warm-border flex items-center justify-center text-charcoal-muted hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-cream border border-warm-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Expected Entitlement:</span>
                <strong className="text-charcoal">₹{selectedCase.expectedAmount.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Actual Disbursed:</span>
                <strong className="text-charcoal">₹{selectedCase.actualAmount.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-warm-border">
                <span className="font-bold text-charcoal">Difference Flagged:</span>
                <strong className={`text-sm ${selectedCase.difference > 0 ? 'text-status-discrepancy-text' : 'text-status-eligible-text'}`}>
                  ₹{selectedCase.difference.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-tint border border-forest/10 text-xs text-forest leading-relaxed space-y-1">
              <div>
                <strong>Audit Note:</strong> {selectedCase.notes || 'Record requires inspection of processing fees and documentation charges.'}
              </div>
              <div className="text-[11px] text-forest/90 pt-1 border-t border-forest/15 flex items-center justify-between">
                <span>
                  <strong>Cited Benchmark:</strong> {selectedCase.recordType === 'Loan' ? 'RBI KCC Waiver Circular & MISS' : 'CACP Kharif/Rabi Price Policy'}
                </span>
                <a
                  href={selectedCase.recordType === 'Loan' ? 'https://www.rbi.org.in' : 'https://cacp.dacnet.nic.in'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-forest hover:text-forest-dark cursor-pointer inline-flex items-center gap-0.5"
                >
                  Source Portal ↗
                </a>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleResolveCase(selectedCase.id)}
                className="w-full h-12 rounded-xl bg-olive hover:bg-forest text-white font-semibold text-xs shadow-soft flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Resolved / Fee Verified</span>
              </button>

              <button
                onClick={() => {
                  alert(`Case ${selectedCase.id} escalated to District Collectorate / Lead Bank Office.`);
                  setSelectedCase(null);
                }}
                className="w-full py-2.5 rounded-xl bg-cream border border-warm-border text-charcoal hover:bg-cream-surface font-semibold text-xs"
              >
                Escalate to District Collectorate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
