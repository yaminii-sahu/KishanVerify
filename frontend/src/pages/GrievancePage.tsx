import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  HelpCircle, 
  Upload, 
  FileText, 
  X, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';

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

  // Sample historical grievances for Ramesh Kumar
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
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${API_BASE}/api/v1/grievances/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_id: farmer.farmerId,
          issue_type: issueType,
          description: description,
          attachment_name: files[0]?.name || 'Supporting_Document.pdf',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmittedGrievance(data);
        setHistory([
          {
            id: data.grievance_ref,
            type: data.issue_type,
            status: 'Open',
            date: data.date,
            desc: data.description,
            officer: 'Assigned to Lead District Officer (Durg)',
          },
          ...history,
        ]);
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      // Fallback
      const fallbackRef = `GRV-2025-${Math.floor(1000 + Math.random() * 9000)}`;
      const fallbackData = {
        grievance_ref: fallbackRef,
        issue_type: issueType,
        status: 'Open',
        description: description,
        date: 'Today',
      };
      setSubmittedGrievance(fallbackData);
      setHistory([
        {
          id: fallbackRef,
          type: issueType,
          status: 'Open',
          date: 'Today',
          desc: description,
          officer: 'Assigned to District Agriculture Office, Durg',
        },
        ...history,
      ]);
    } finally {
      setIsSubmitting(false);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#4E6E3D', '#FAF8F2', '#B45309'],
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/farmer')}
          className="w-10 h-10 rounded-2xl bg-white border border-warm-border flex items-center justify-center text-gray-700 hover:bg-sage-50 transition-colors shadow-soft"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {language === 'hi' ? 'शिकायत दर्ज करें' : 'Raise a Grievance'}
          </h1>
          <p className="text-xs text-gray-500">
            Report any issue related to loan, MSP, insurance or scheme
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form (Matches mockup Screen 9 exactly) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-warm-border shadow-card space-y-4">
          
          {submittedGrievance ? (
            <div className="py-6 text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-[#EDF7ED] text-[#2E7D32] border border-[#C8E6C9] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sage-700">
                  Ticket Created
                </span>
                <h3 className="text-2xl font-black text-gray-900 font-mono mt-1">
                  {submittedGrievance.grievance_ref}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Your complaint has been logged and forwarded to the designated nodal officer.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-warm-bg border border-warm-border text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Issue Type:</span>
                  <span className="font-semibold text-gray-900">{submittedGrievance.issue_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Beneficiary:</span>
                  <span className="font-semibold text-gray-900">{farmer.name} ({farmer.farmerId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Assignment:</span>
                  <span className="font-semibold text-sage-800">SBI Patan / Durg Civil Supplies</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setSubmittedGrievance(null)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-xs shadow-soft"
                >
                  Raise Another Issue
                </button>
                <button
                  onClick={() => navigate('/admin')}
                  className="px-4 py-3 rounded-2xl bg-white border border-warm-border text-gray-700 font-semibold text-xs hover:bg-warm-bg"
                >
                  View in Admin Portal
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Issue Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Issue Type
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full px-4 py-3 bg-warm-bg rounded-2xl border border-warm-border text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                >
                  <option value="Loan Discrepancy">Loan Discrepancy (वितरण अंतर)</option>
                  <option value="MSP Payment Delay">MSP Payment Delay (एमएसपी भुगतान देरी)</option>
                  <option value="Crop Insurance Claim Issue">Crop Insurance Claim Issue (फसल बीमा समस्या)</option>
                  <option value="Scheme Eligibility">Scheme Eligibility Inquiry (योजना पात्रता)</option>
                </select>
              </div>

              {/* Description + Counter */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Describe Your Issue
                  </label>
                  <span className="text-[11px] font-mono text-gray-400">
                    {description.length}/{maxChars}
                  </span>
                </div>
                <textarea
                  value={description}
                  maxLength={maxChars}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full p-4 bg-warm-bg rounded-2xl border border-warm-border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500 resize-none leading-relaxed"
                  placeholder="Explain the difference or issue you noticed in your records..."
                  required
                />
              </div>

              {/* Upload Document Section (Matches mockup file card) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Upload Document (Optional)
                </label>

                <div className="space-y-2">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-warm-card rounded-2xl border border-warm-border flex items-center justify-between shadow-soft"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{file.name}</p>
                          <p className="text-[10px] text-gray-400">{file.size}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="w-7 h-7 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddFile}
                    className="w-full py-2.5 rounded-2xl border-2 border-dashed border-warm-border hover:border-sage-400 text-xs font-semibold text-gray-600 hover:text-sage-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-sage-600" />
                    <span>+ Add more files</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 py-3 px-6 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-sm shadow-card flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Registering grievance...</span>
                  ) : (
                    <span>Submit Grievance</span>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Right Pane: Grievance History */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-warm-border shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-warm-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Grievance History
                </h3>
                <p className="text-xs text-gray-500">Track logged complaints</p>
              </div>
              <span className="text-xs font-semibold text-sage-700">
                {history.length} Total
              </span>
            </div>

            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-warm-bg border border-warm-border space-y-2 hover:border-sage-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-gray-900">
                      {item.id}
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  <p className="text-xs font-semibold text-gray-800">{item.type}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>

                  <div className="pt-1 border-t border-warm-border/60 flex items-center justify-between text-[11px] text-gray-400">
                    <span>{item.date}</span>
                    <span className="text-sage-700 font-medium truncate max-w-[180px]">
                      {item.officer}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
