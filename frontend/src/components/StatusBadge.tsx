import React from 'react';
import { VerificationStatus } from '../types';
import { CheckCircle2, AlertCircle, Clock, ShieldCheck, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface StatusBadgeProps {
  status: VerificationStatus | 'Eligible' | 'Possibly Eligible' | 'Not Eligible' | 'Open' | 'Resolved' | 'In Progress' | 'Escalated';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const { language } = useLanguage();

  let bgClass = 'bg-gray-100 text-gray-700 border-gray-200';
  let icon = <HelpCircle className="w-3.5 h-3.5 mr-1" />;
  let label: string = status;

  if (status === 'Verified' || status === 'Eligible' || status === 'Resolved') {
    bgClass = 'bg-[#EDF7ED] text-[#2E7D32] border-[#C8E6C9]';
    icon = <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0" />;
    label = language === 'hi' 
      ? (status === 'Eligible' ? 'पात्र' : status === 'Resolved' ? 'समाधान' : 'सत्यापित')
      : status;
  } else if (status === 'Needs Review' || status === 'Possible Discrepancy') {
    bgClass = 'bg-[#FDECEB] text-[#C53030] border-[#F5C2C0]';
    icon = <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />;
    label = language === 'hi'
      ? (status === 'Needs Review' ? 'समीक्षा आवश्यक' : 'संभावित अंतर')
      : status;
  } else if (status === 'Possibly Eligible' || status === 'In Progress') {
    bgClass = 'bg-[#FEF3E2] text-[#B45309] border-[#FDE68A]';
    icon = <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />;
    label = language === 'hi'
      ? (status === 'Possibly Eligible' ? 'संभावित पात्र' : 'प्रक्रियाधीन')
      : status;
  } else if (status === 'Under Review' || status === 'Open') {
    bgClass = 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]';
    icon = <Clock className="w-3.5 h-3.5 mr-1 shrink-0" />;
    label = language === 'hi' ? 'प्रक्रियाधीन' : status;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${bgClass}`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
