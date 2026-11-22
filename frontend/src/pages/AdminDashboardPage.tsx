import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquareWarning, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  X,
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight,
  Sparkles,
  Layers,
  ChevronRight
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

  // Pre-seeded cases matching blueprint examples
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
    { name: 'Loan Deductions', value: 45, color: '#4E6E3D' },
    { name: 'MSP Differences', value: 35, color: '#B45309' },
    { name: 'Insurance Claims', value: 20, color: '#1D4ED8' },
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
      
      {/* Stat Cards (Matching mockups Screen 6 / Dashboard-2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Records */}
        <div className="bg-white rounded-3xl p-5 border border-warm-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Total Records
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {stats.totalRecords.toLocaleString()}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Audited in database</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sage-50 text-sage-700 flex items-center justify-center shadow-soft">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        {/* Verified */}
        <div className="bg-white rounded-3xl p-5 border border-warm-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Verified
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2E7D32]">
              {stats.verifiedCount.toLocaleString()}
            </h3>
            <p className="text-[11px] text-green-700 mt-0.5">87.9% Match rate</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#EDF7ED] text-[#2E7D32] flex items-center justify-center shadow-soft">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Discrepancies */}
        <div className="bg-white rounded-3xl p-5 border border-warm-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Discrepancies
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-kisan-red">
              {stats.discrepanciesCount}
            </h3>
            <p className="text-[11px] text-red-600 mt-0.5">Under investigation</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-kisan-lightred text-kisan-red flex items-center justify-center shadow-soft">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Complaints */}
        <div className="bg-white rounded-3xl p-5 border border-warm-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Pending Complaints
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-700">
              {stats.pendingComplaints}
            </h3>
            <p className="text-[11px] text-amber-600 mt-0.5">Awaiting officer reply</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FEF3E2] text-amber-700 flex items-center justify-center shadow-soft">
            <MessageSquareWarning className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Recent Cases Section (Matches mockup table layout) */}
      <div className="bg-white rounded-3xl p-6 border border-warm-border shadow-card space-y-4">
        
        {/* Table Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-warm-border pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Recent Cases
            </h2>
            <p className="text-xs text-gray-500">
              Review individual farmer loans, MSP and insurance reconciliations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search farmer or ID..."
                className="pl-9 pr-4 py-2 bg-warm-bg rounded-2xl border border-warm-border text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500 w-48 sm:w-60"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-warm-bg rounded-2xl border border-warm-border text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Verified">Verified</option>
              <option value="Under Review">Under Review</option>
            </select>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-sage-50 text-sage-800 border border-sage-200 hover:bg-sage-100 text-xs font-semibold shadow-soft transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-sage-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Cases Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-warm-border text-gray-400 uppercase tracking-wider font-semibold text-[11px]">
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
                <tr key={c.id} className="hover:bg-warm-bg/70 transition-colors group">
                  <td className="py-3.5 pl-2">
                    <div>
                      <p className="font-bold text-gray-900">{c.farmerName}</p>
                      <p className="text-[11px] font-mono text-gray-400">{c.farmerId} • {c.district}</p>
                    </div>
                  </td>
                  <td className="py-3.5 font-medium text-gray-700">
                    <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-800 font-mono text-[11px]">
                      {c.recordType}
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-semibold text-gray-900">
                    ₹{c.expectedAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-right font-semibold text-gray-900">
                    ₹{c.actualAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-center">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-3.5 text-right pr-2">
                    <button
                      onClick={() => setSelectedCase(c)}
                      className="px-3 py-1.5 rounded-xl bg-sage-50 text-sage-700 border border-sage-200 hover:bg-sage-600 hover:text-white transition-all text-xs font-semibold shadow-soft"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Analytics Section with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* District Breakdown Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-warm-border shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-warm-border pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Discrepancy Trends by District
              </h3>
              <p className="text-xs text-gray-500">Verified matches vs records needing review</p>
            </div>
            <TrendingUp className="w-4 h-4 text-sage-600" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtChartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip />
                <Bar dataKey="verified" name="Verified Match" fill="#4E6E3D" radius={[6, 6, 0, 0]} />
                <Bar dataKey="discrepancies" name="Discrepancies" fill="#C53030" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Discrepancy Breakdown by Type Pie Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-warm-border shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-warm-border pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Discrepancies by Category
              </h3>
              <p className="text-xs text-gray-500">Distribution across agricultural programs</p>
            </div>
            <Layers className="w-4 h-4 text-sage-600" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
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

      {/* Case Review Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-warm-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sage-700">
                  {selectedCase.id}
                </span>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedCase.farmerName} • {selectedCase.recordType} Case
                </h3>
                <p className="text-xs text-gray-500">Farmer ID: {selectedCase.farmerId} • {selectedCase.district}</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-warm-bg border border-warm-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Expected Entitlement:</span>
                <strong className="text-gray-900">₹{selectedCase.expectedAmount.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Actual Disbursed:</span>
                <strong className="text-gray-900">₹{selectedCase.actualAmount.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-warm-border">
                <span className="font-bold text-gray-900">Difference Flagged:</span>
                <strong className={`text-sm ${selectedCase.difference > 0 ? 'text-kisan-red' : 'text-[#2E7D32]'}`}>
                  ₹{selectedCase.difference.toLocaleString()}
                </strong>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200 text-xs text-sage-900 leading-relaxed">
              <strong>Audit Note:</strong> {selectedCase.notes || 'Record requires inspection of processing fees and documentation charges.'}
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleResolveCase(selectedCase.id)}
                className="w-full py-3 rounded-2xl bg-[#2E7D32] hover:bg-green-800 text-white font-semibold text-xs shadow-soft flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Resolved / Fee Verified</span>
              </button>

              <button
                onClick={() => {
                  alert(`Case ${selectedCase.id} escalated to District Collectorate / Lead Bank Office.`);
                  setSelectedCase(null);
                }}
                className="w-full py-2.5 rounded-2xl bg-white border border-warm-border text-gray-700 hover:bg-warm-bg font-semibold text-xs"
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
