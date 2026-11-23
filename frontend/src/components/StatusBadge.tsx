import React from 'react';
import { VerificationStatus } from '../types';
import { CheckCircle2, AlertCircle, Clock, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface StatusBadgeProps {
  status: VerificationStatus | 'Eligible' | 'Possibly Eligible' | 'Not Eligible' | 'Open' | 'Resolved' | 'In Progress' | 'Escalated' | 'Under Review';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const { language } = useLanguage();

  let bgClass = 'bg-cream text-charcoal border-warm-border';
  let icon = <HelpCircle className="w-3 h-3 mr-1" />;
  let label: string = status;

  if (status === 'Verified' || status === 'Eligible' || status === 'Resolved') {
    bgClass = 'bg-status-eligible-bg text-status-eligible-text border-status-eligible-text/20';
    icon = <CheckCircle2 className="w-3 h-3 mr-1 shrink-0" />;
    label = language === 'hi' 
      ? (status === 'Eligible' ? 'पात्र' : status === 'Resolved' ? 'समाधान' : 'सत्यापित')
      : status;
  } else if (status === 'Needs Review' || status === 'Possible Discrepancy') {
    bgClass = 'bg-status-discrepancy-bg text-status-discrepancy-text border-status-discrepancy-text/25';
    icon = <AlertCircle className="w-3 h-3 mr-1 shrink-0" />;
    label = language === 'hi'
      ? (status === 'Needs Review' ? 'समीक्षा आवश्यक' : 'संभावित अंतर')
      : status;
  } else if (status === 'Possibly Eligible' || status === 'In Progress' || status === 'Under Review' || status === 'Open') {
    bgClass = 'bg-status-review-bg text-status-review-text border-status-review-text/25';
    icon = <Clock className="w-3 h-3 mr-1 shrink-0" />;
    label = language === 'hi'
      ? (status === 'Possibly Eligible' ? 'संभावित पात्र' : 'प्रक्रियाधीन')
      : status;
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border shadow-soft ${sizeClasses} ${bgClass}`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
