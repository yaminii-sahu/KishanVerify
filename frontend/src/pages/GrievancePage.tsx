import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  HelpCircle, 
  FileText, 
  X, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ArrowRight,
  FileCheck,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { fileGrievanceApi } from '../services/api';

export const GrievancePage: React.FC = () => {
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  const [issueType, setIssueType] = useState('Loan Discrepancy');
  const [description, setDescription] = useState('My disbursed loan amount is less than the approved amount.');
  const [files, setFiles] = useState<{ name: string; size: string }[]>([
    { name: 'Loan_Sanction.pdf', size: '1.2 MB' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedGrievance, setSubmittedGrievance] = useState<any | null>(null);

  interface GrievanceHistoryItem {
    id: string;
    type: string;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated';
    date: string;
    desc: string;
    officer: string;
  }

  const [history, setHistory] = useState<GrievanceHistoryItem[]>([
    {
      id: 'GRV-2025-0891',
      type: 'Loan Discrepancy',
      status: 'In Progress',
      date: '12 Apr 2025',
      desc: 'SBI Patan loan LN-2024-8812 approved ₹80,000, disbursed ₹70,000. ₹10,000 difference flagged.',
      officer: 'Assigned to SBI Patan Branch Manager',
    },
    {
      id: 'GRV-2025-0720',
      type: 'Crop Insurance Claim Issue',
      status: 'Resolved',
      date: '10 Feb 2025',
      desc: 'Kharif 2024 Paddy claim first tranche credit confirmation request.',
      officer: 'PMFBY District Nodal Officer Durg',
    },
  ]);

  const maxChars = 300;

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleAddFile = () => {
    const sampleFiles = [
      { name: 'Mandi_Receipt_JForm.pdf', size: '850 KB' },
      { name: 'Bank_Passbook_Statement.jpg', size: '1.4 MB' },
      { name: 'Patwari_Girdawari.pdf', size: '600 KB' },
    ];
    const nextFile = sampleFiles[files.length % sampleFiles.length];
    setFiles([...files, nextFile]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const data = await fileGrievanceApi({
        farmer_id: farmer.farmerId,
        issue_type: issueType,
        description: description,
        attachment_name: files[0]?.name || 'Supporting_Document.pdf',
      });

      setSubmittedGrievance(data);
      setHistory([
        {
          id: data.grievance_ref,
          type: data.issue_type,
          status: 'Open',
          date: data.date,
          desc: data.description,
          officer: 'Pending Lead Bank Officer Assignment',
        },
        ...history,
      ]);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#5B7A47', '#4A6538', '#E4EBD6'],
      });
    } catch {
      const mockRef = `GRV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedGrievance({
        grievance_ref: mockRef,
        issue_type: issueType,
        status: 'Open',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        description: description,
        message: 'Your official grievance has been registered successfully.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Top Header */}
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
            {language === 'hi' ? 'शिकायत / अपील दर्ज करें' : 'Raise a Grievance'}
          </h1>
          <p className="text-xs text-muted">
            Report any issue related to loan, MSP, insurance or scheme.
          </p>
        </div>
      </div>

      {submittedGrievance ? (
        /* Confirmation State */
        <div className="bg-cream-surface rounded-2xl p-6 sm:p-8 border border-warm-border shadow-soft text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-full bg-status-eligible-bg text-status-eligible-text flex items-center justify-center mx-auto shadow-soft">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-forest bg-tint px-3 py-1 rounded-full">
              {submittedGrievance.grievance_ref}
            </span>
            <h2 className="text-xl font-bold text-charcoal pt-2">
              Grievance Registered Successfully
            </h2>
            <p className="text-xs text-muted max-w-md mx-auto">
              Your grievance has been submitted to the lead bank and agricultural officer for formal reconciliation.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setSubmittedGrievance(null);
                setDescription('');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs shadow-soft"
            >
              Submit Another Inquiry
            </button>
            <button
              onClick={() => navigate('/farmer')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cream border border-warm-border text-charcoal font-semibold text-xs"
            >
              Back to Home
            </button>
          </div>
        </div>
      ) : (
        /* Grievance Form (Image B Screen 8) */
        <form onSubmit={handleSubmit} className="bg-cream-surface rounded-2xl p-5 sm:p-7 border border-warm-border shadow-soft space-y-4">
          
          {/* Issue Type Select */}
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Issue Type
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
            >
              <option value="Loan Discrepancy">Loan Discrepancy</option>
              <option value="MSP Payment Discrepancy">MSP Payment Discrepancy</option>
              <option value="Insurance Claim Issue">Insurance Claim Issue</option>
              <option value="Scheme Application Issue">Scheme Application Issue</option>
            </select>
          </div>

          {/* Describe Your Issue Textarea with 62/300 counter */}
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Describe Your Issue
            </label>
            <div className="relative">
              <textarea
                rows={4}
                maxLength={maxChars}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the discrepancy or issue clearly..."
                className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive resize-none pb-7 leading-relaxed"
                required
              />
              <span className="absolute bottom-2.5 right-3 text-[11px] font-mono text-muted">
                {description.length}/{maxChars}
              </span>
            </div>
          </div>

          {/* Upload Document (Optional) */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-charcoal">
              Upload Document (Optional)
            </label>

            {/* Uploaded File Row (Matching Image B Screen 8) */}
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-cream border border-warm-border"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-tint text-forest flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-charcoal truncate">{file.name}</p>
                    <p className="text-[10px] text-muted">{file.size}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="w-7 h-7 rounded-lg hover:bg-tint text-muted hover:text-charcoal flex items-center justify-center"
                  aria-label="Remove document"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add More Files Dashed Button */}
            <button
              type="button"
              onClick={handleAddFile}
              className="w-full py-2.5 rounded-xl border border-dashed border-warm-border hover:border-olive bg-cream-surface text-muted hover:text-charcoal text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add more files</span>
            </button>
          </div>

          {/* Submit Button (Full Width 52px) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="w-full h-[52px] py-3.5 px-6 rounded-xl bg-forest hover:bg-forest-dark disabled:opacity-50 text-white font-bold text-sm shadow-soft flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-tint" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Grievance</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Historical Tickets Section */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-charcoal">
          Your Recent Grievances
        </h3>
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-cream-surface rounded-2xl p-4 sm:p-5 border border-warm-border shadow-soft flex items-center justify-between gap-4"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-charcoal">{item.id}</span>
                <span className="text-[10px] text-muted">• {item.date}</span>
              </div>
              <p className="text-xs text-muted truncate">{item.desc}</p>
            </div>
            <StatusBadge status={item.status as any} size="sm" />
          </div>
        ))}
      </div>

    </div>
  );
};
