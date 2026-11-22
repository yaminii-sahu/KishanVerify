import React, { useState } from 'react';
import { 
  MessageSquareWarning, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowUpRight,
  X,
  FileText
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const AdminComplaintsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const [complaints, setComplaints] = useState([
    {
      id: 'GRV-2025-0891',
      farmerName: 'Ramesh Kumar',
      farmerId: 'FV12345',
      district: 'Durg',
      type: 'Loan Discrepancy',
      status: 'In Progress' as const,
      date: '12 Apr 2025',
      desc: 'Approved loan amount was ₹80,000 under KCC, but bank disbursed ₹70,000 into my savings account. Please review the ₹10,000 difference.',
      attachment: 'Loan_Sanction_SBI_Patan.pdf',
      notes: 'Assigned to SBI Patan Branch Manager for review of processing fee & PMFBY deductions.',
    },
    {
      id: 'GRV-2025-0914',
      farmerName: 'Mohan Lal',
      farmerId: 'FV54321',
      district: 'Durg',
      type: 'MSP Payment Delay',
      status: 'Open' as const,
      date: '10 Apr 2025',
      desc: 'Procurement receipt showed 50 quintals wheat at MSP ₹2,275, but total disbursement is delayed by over 25 days.',
      attachment: 'Wheat_Mandi_Slip.pdf',
      notes: 'Forwarded to District Food & Civil Supplies Officer Durg.',
    },
    {
      id: 'GRV-2025-0742',
      farmerName: 'Sita Devi',
      farmerId: 'FV67890',
      district: 'Durg',
      type: 'Crop Insurance Claim Issue',
      status: 'Resolved' as const,
      date: '15 Feb 2025',
      desc: 'First installment of Paddy PMFBY claim received; inquiry regarding second tranche release schedule.',
      attachment: 'PMFBY_Claim_Acknowledgment.pdf',
      notes: 'Explanation provided on CCE assessment cycle. Amount credited.',
    },
  ]);

  const handleResolve = (id: string) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, status: 'Resolved' as const, notes: resolutionText || 'Resolved by Bank Lead Officer.' } : c));
    setSelectedComplaint(null);
    setResolutionText('');
  };

  const filtered = complaints.filter(c => statusFilter === 'All' || c.status.toLowerCase() === statusFilter.toLowerCase());

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Grievances & Farmer Complaints
          </h1>
          <p className="text-xs text-gray-500">
            Official complaints submitted through the KisanVerify portal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white rounded-2xl border border-warm-border text-xs font-semibold text-gray-700 shadow-soft focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-5 border border-warm-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-sage-400 transition-all"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs text-gray-900 px-2 py-0.5 rounded-lg bg-gray-100">
                  {item.id}
                </span>
                <span className="text-xs font-bold text-gray-800">{item.type}</span>
                <StatusBadge status={item.status} size="sm" />
              </div>

              <p className="text-sm font-semibold text-gray-900">
                {item.farmerName} • <span className="font-mono text-xs text-gray-500">ID: {item.farmerId} ({item.district})</span>
              </p>

              <p className="text-xs text-gray-600 leading-relaxed">
                "{item.desc}"
              </p>

              <div className="text-[11px] text-gray-400 flex items-center gap-4">
                <span>Submitted: {item.date}</span>
                {item.attachment && (
                  <span className="text-sage-700 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {item.attachment}
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
              <button
                onClick={() => setSelectedComplaint(item)}
                className="px-4 py-2 rounded-2xl bg-sage-50 text-sage-800 border border-sage-200 hover:bg-sage-600 hover:text-white transition-all text-xs font-semibold shadow-soft"
              >
                Review & Resolve
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resolution Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-warm-border space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-sage-700">{selectedComplaint.id}</span>
                <h3 className="text-lg font-bold text-gray-900">{selectedComplaint.farmerName}</h3>
                <p className="text-xs text-gray-500">{selectedComplaint.type}</p>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-warm-bg rounded-2xl text-xs text-gray-700 space-y-1">
              <p className="font-semibold text-gray-900">Complaint Details:</p>
              <p className="leading-relaxed">{selectedComplaint.desc}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Officer Resolution Note
              </label>
              <textarea
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Explain the resolution or fee audit findings..."
                rows={3}
                className="w-full p-3 bg-warm-bg rounded-2xl border border-warm-border text-xs focus:outline-none focus:ring-2 focus:ring-sage-500 resize-none"
              />
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleResolve(selectedComplaint.id)}
                className="w-full py-3 rounded-2xl bg-[#2E7D32] hover:bg-green-800 text-white font-semibold text-xs shadow-soft flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Resolved</span>
              </button>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="w-full py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
