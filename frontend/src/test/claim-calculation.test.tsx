import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClaimCalculationCard } from '../components/ClaimCalculationCard';
import { LanguageProvider } from '../context/LanguageContext';
import { InsuranceVerificationOutput } from '../services/api';

const mockMatchResult: InsuranceVerificationOutput = {
  status: 'Verified',
  crop: 'Paddy',
  claim_amount_expected: 30000,
  claim_amount_calculated: 30000,
  amount_received: 30000,
  difference: 0,
  claim_status: 'Settled',
  is_flagged: false,
  is_match: true,
  tolerance: 100,
  status_label: 'Claim Settled in Full / Figures Match',
  status_label_hi: 'दावे का पूर्ण निपटान / आंकड़े मेल खाते हैं',
  explanation: 'Your crop insurance claim of ₹30,000 matches received disbursements within ₹100 tolerance. Figures match.',
  explanation_hi: 'आपका ₹30,000 का फसल बीमा दावा बैंक में प्राप्त ₹30,000 से मेल खाता है।',
  reasons: ['100% of assessed insurance indemnity released to farmer account.'],
  reasons_hi: ['निर्धारित बीमा राशि का 100% किसान खाते में जमा।'],
  reason_codes: ['MATCH_VERIFIED'],
  arithmetic_breakdown: [
    { label: 'Assessed Claim Entitlement', label_hi: 'निर्धारित दावा राशि', amount: 30000 },
    { label: 'Disbursed Insurance Claim', label_hi: 'प्राप्त बीमा राशि', amount: 30000 },
    { label: 'Pending Claim Balance', label_hi: 'लंबित दावा शेष', amount: 0 },
  ],
  step_by_step_arithmetic: [
    {
      step: 1,
      label: 'Insured Land Area (Paddy)',
      label_hi: 'बीमित कृषि रकबा (Paddy)',
      value: '2.00 Hectares',
      amount: 2.0,
      data_origin: 'bank_document',
      source_name: 'PMFBY Policy Schedule',
    },
    {
      step: 2,
      label: 'Total Sum Insured for Parcel',
      label_hi: 'कुल बीमित राशि (समस्त रकबा)',
      value: '₹80,000.00',
      amount: 80000,
      data_origin: 'official',
      source_name: 'SLCCCI District Notification',
    },
    {
      step: 3,
      label: 'Joint Assessed Crop Loss',
      label_hi: 'संयुक्त खेत सर्वेक्षण में निर्धारित फसल क्षति',
      value: '37.5%',
      amount: 37.5,
      data_origin: 'official',
      source_name: 'Joint Survey Sheet',
    },
    {
      step: 4,
      label: 'Calculated Claim Entitlement [Step 2 × Step 3]',
      label_hi: 'निर्धारित वैधानिक दावा पात्रता [चरण 2 × चरण 3]',
      value: '₹30,000.00',
      amount: 30000,
      data_origin: 'official',
      source_name: 'PMFBY Guidelines Section XII',
    },
  ],
  why_flagged_details: 'All verified parameters align with PMFBY statutory rules.',
  why_flagged_details_hi: 'सभी सत्यापित पैरामीटर पीएमएफबीवाई नियमों के अनुरूप हैं।',
  next_steps: ['Insurance record complete and archived.'],
  next_steps_hi: ['बीमा रिकॉर्ड पूर्ण।'],
  sources: [],
};

const mockShortfallResult: InsuranceVerificationOutput = {
  ...mockMatchResult,
  status: 'Needs Review',
  amount_received: 20000,
  difference: 10000,
  is_flagged: true,
  is_match: false,
  status_label: 'Insurance Discrepancy Flagged (Needs Review)',
  status_label_hi: 'बीमा विसंगति पाई गई (समीक्षा आवश्यक)',
  explanation: 'Claim entitlement was assessed at ₹30,000, but only ₹20,000 was disbursed. The difference of ₹10,000 requires verification.',
  explanation_hi: 'दावा पात्रता ₹30,000 निर्धारित थी, परंतु केवल ₹20,000 वितरित किए गए।',
  why_flagged_details: 'A discrepancy flag is never proof of wrongdoing. Secondary tranche or acreage adjustment may apply.',
  why_flagged_details_hi: 'विसंगति का कोई भी संकेत किसी गड़बड़ी का प्रमाण नहीं है।',
};

describe('ClaimCalculationCard', () => {
  it('renders verified figures match state when difference is zero', () => {
    render(
      <LanguageProvider>
        <ClaimCalculationCard result={mockMatchResult} />
      </LanguageProvider>
    );

    expect(screen.getByText(/Figures Match \(Fully Settled\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Assessed Entitlement/i)).toBeInTheDocument();
    expect(screen.getByText(/Received in Bank/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Figures Match/i).length).toBeGreaterThan(0);
  });

  it('renders discrepancy and shortfall metrics when difference exists', () => {
    render(
      <LanguageProvider>
        <ClaimCalculationCard result={mockShortfallResult} />
      </LanguageProvider>
    );

    expect(screen.getByText(/Insurance Discrepancy Flagged \(Needs Review\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Reconciliation/i)).toBeInTheDocument();
    expect(screen.getByText('₹10,000')).toBeInTheDocument();
  });

  it('renders step-by-step arithmetic table and toggles why flagged drawer', () => {
    render(
      <LanguageProvider>
        <ClaimCalculationCard result={mockShortfallResult} />
      </LanguageProvider>
    );

    expect(screen.getByText(/Step-by-Step Calculation & Sources/i)).toBeInTheDocument();
    expect(screen.getByText(/2.00 Hectares/i)).toBeInTheDocument();
    expect(screen.getByText('37.5%')).toBeInTheDocument();

    const drawerBtn = screen.getByText(/Why was this record flagged for review\?/i);
    fireEvent.click(drawerBtn);

    expect(screen.getByText(/A discrepancy flag is never proof of wrongdoing/i)).toBeInTheDocument();
    expect(screen.getByText(/Notice: This calculation is an informational comparison/i)).toBeInTheDocument();
  });
});
