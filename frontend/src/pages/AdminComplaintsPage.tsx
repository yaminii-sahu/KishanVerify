import React, { useState } from 'react';
import { 
  MessageSquareWarning, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
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
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal tracking-tight flex items-center gap-2">
            <MessageSquareWarning className="w-6 h-6 text-forest" />
            Grievances & Farmer Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
            Official inquiries submitted through the KisanVerify portal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-cream-surface rounded-xl border border-warm-border text-xs font-semibold text-charcoal shadow-soft focus:outline-none focus:ring-2 focus:ring-olive cursor-pointer"
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
            className="bg-cream-surface rounded-2xl p-5 border border-warm-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-olive/40 transition-all"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-forest bg-tint px-2 py-0.5 rounded-md">
                  {item.id}
                </span>
                <span className="text-xs font-bold text-charcoal">
                  {item.farmerName} ({item.farmerId})
                </span>
                <span className="text-xs text-charcoal-muted">• {item.district}</span>
                <StatusBadge status={item.status as any} size="sm" />
              </div>

              <h3 className="text-sm sm:text-base font-bold text-charcoal">
                {item.type}
              </h3>

              <p className="text-xs text-charcoal leading-relaxed bg-cream p-3 rounded-xl border border-warm-border">
                "{item.desc}"
              </p>

              {item.notes && (
                <p className="text-[11px] text-charcoal-muted flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-forest" />
                  <span><strong>Audit Trail:</strong> {item.notes}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2 shrink-0">
              <button
                onClick={() => setSelectedComplaint(item)}
                className="px-4 py-2 rounded-xl bg-olive hover:bg-forest text-white text-xs font-semibold shadow-soft transition-colors"
              >
                Review & Respond
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-cream-surface rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-warm-border space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-warm-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest">
                  {selectedComplaint.id}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-charcoal">
                  {selectedComplaint.farmerName} • {selectedComplaint.type}
                </h3>
                <p className="text-xs text-charcoal-muted">District: {selectedComplaint.district}</p>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="w-8 h-8 rounded-full bg-cream border border-warm-border flex items-center justify-center text-charcoal-muted hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-cream border border-warm-border space-y-2 text-xs">
              <p className="font-semibold text-charcoal">Farmer's Statement:</p>
              <p className="text-charcoal-muted leading-relaxed">"{selectedComplaint.desc}"</p>
              {selectedComplaint.attachment && (
                <div className="flex items-center gap-1.5 text-forest font-semibold pt-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Attachment: {selectedComplaint.attachment}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Official Resolution / Clarification Note
              </label>
              <textarea
                rows={3}
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="E.g., Verified fee deductions of ₹5,000 for PMFBY premium. Detailed statement dispatched to farmer."
                className="w-full p-3 bg-cream border border-warm-border rounded-xl text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-olive"
              />
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleResolve(selectedComplaint.id)}
                className="w-full h-12 rounded-xl bg-olive hover:bg-forest text-white font-semibold text-xs shadow-soft flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Resolved & Notify Farmer</span>
              </button>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="w-full py-2.5 rounded-xl bg-cream border border-warm-border text-charcoal font-semibold text-xs hover:bg-cream-surface"
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
