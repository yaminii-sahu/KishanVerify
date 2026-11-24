import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ClaimReasonsAndCoverageCard } from '../components/ClaimReasonsAndCoverageCard';
import { LanguageProvider } from '../context/LanguageContext';
import { InsuranceVerificationOutput } from '../services/api';

const mockResult: InsuranceVerificationOutput = {
  status: 'Under Review',
  crop: 'Paddy (Kharif)',
  claim_amount_expected: 30000,
  claim_amount_calculated: 30000,
  amount_received: 20000,
  difference: 10000,
  claim_status: 'Under Review',
  is_flagged: false,
  is_match: false,
  tolerance: 100,
  status_label: 'Claim Under Review',
  status_label_hi: 'दावा प्रक्रियाधीन',
  explanation: 'Secondary tranche pending.',
  explanation_hi: 'द्वितीय किश्त लंबित।',
  reasons: ['Secondary tranche pending'],
  reasons_hi: ['द्वितीय किश्त लंबित'],
  reason_codes: ['UNDER_REVIEW_TRANCHE', 'MISSING_DOCUMENTS'],
  structured_reasons: [
    {
      code: 'UNDER_REVIEW_TRANCHE',
      category: 'informational',
      label_en: 'Secondary Tranche Staged Disbursement',
      label_hi: 'द्वितीय किश्त चरणबद्ध वितरण',
      explanation_en: 'Initial tranche released. Secondary tranche pending state share release.',
      explanation_hi: 'प्रारंभिक किश्त जारी की गई। राज्य सब्सिडी अंश के बाद शेष जारी होगा।',
      how_to_fix_en: 'No action required from farmer. District reconciliations scheduled fortnightly.',
      how_to_fix_hi: 'किसान की ओर से किसी कार्रवाई की आवश्यकता नहीं।',
      required_document: null,
      vault_action_url: null,
    },
    {
      code: 'MISSING_DOCUMENTS',
      category: 'action_required',
      label_en: 'Verification Documents Incomplete',
      label_hi: 'सत्यापन दस्तावेज़ अधूरे',
      explanation_en: 'Claim settlement is paused because mandatory documents are not on record.',
      explanation_hi: 'अनिवार्य दस्तावेज़ पोर्टल पर उपलब्ध नहीं हैं।',
      how_to_fix_en: 'Upload your missing land documents to your KisanVerify Document Vault.',
      how_to_fix_hi: 'लापता दस्तावेज़ किसानवेरीफाई डाक्यूमेंट्स में अपलोड करें।',
      required_document: 'Sowing Certificate (Girdawari) & Land Record (B-1)',
      vault_action_url: '/farmer/documents',
    },
  ],
  arithmetic_breakdown: [],
  step_by_step_arithmetic: [],
  coverage: {
    checked: [
      { check: 'Statutory PMFBY calculation formula', status: 'verified' },
      { check: 'District sum insured benchmark', status: 'verified' },
    ],
    not_checked: [
      { check: 'Satellite Girdawari acreage match', reason: 'Patwari sowing certificate not uploaded to Vault' },
    ],
    coverage_score: 0.75,
  },
  next_steps: ['Check status'],
  next_steps_hi: ['स्थिति जांचें'],
  sources: [],
};

describe('ClaimReasonsAndCoverageCard', () => {
  it('renders structured reason codes, category badges, and resolution steps', () => {
    render(
      <BrowserRouter>
        <LanguageProvider>
          <ClaimReasonsAndCoverageCard result={mockResult} />
        </LanguageProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Claim Status & Reason Analysis/i)).toBeInTheDocument();
    expect(screen.getByText('UNDER_REVIEW_TRANCHE')).toBeInTheDocument();
    expect(screen.getByText('MISSING_DOCUMENTS')).toBeInTheDocument();
    expect(screen.getByText(/Secondary Tranche Staged Disbursement/i)).toBeInTheDocument();

    // Toggle second accordion to see document requirement and button
    const missingDocsHeader = screen.getByText(/Verification Documents Incomplete/i);
    fireEvent.click(missingDocsHeader);

    expect(screen.getByText(/Sowing Certificate \(Girdawari\) & Land Record \(B-1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload to Vault/i)).toBeInTheDocument();
  });

  it('renders verification coverage with progress bar and skipped checks with reasons', () => {
    render(
      <BrowserRouter>
        <LanguageProvider>
          <ClaimReasonsAndCoverageCard result={mockResult} />
        </LanguageProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Verification Coverage & Completeness/i)).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText(/Statutory PMFBY calculation formula/i)).toBeInTheDocument();
    expect(screen.getByText(/Satellite Girdawari acreage match/i)).toBeInTheDocument();
    expect(screen.getByText(/Patwari sowing certificate not uploaded to Vault/i)).toBeInTheDocument();
  });
});
