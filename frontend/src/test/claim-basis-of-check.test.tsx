import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { BasisOfCheckCard } from '../components/BasisOfCheckCard';
import { LanguageProvider } from '../context/LanguageContext';
import { SourceCitation } from '../services/api';

const mockSources: SourceCitation[] = [
  {
    rule_code: 'PMFBY-REV-GUIDELINES-2020',
    scheme_name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    scheme_name_hi: 'प्रधानमंत्री फसल बीमा योजना (पीएमएफबीवाई)',
    authority: 'Ministry of Agriculture & Farmers Welfare, GoI',
    authority_hi: 'कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार',
    document: 'PMFBY Revised Operational Guidelines 2020',
    document_hi: 'पीएमएफबीवाई संशोधित परिचालन दिशानिर्देश 2020',
    url: 'https://pmfby.gov.in',
    effective_from: '2020-04-01',
    effective_to: null,
    last_verified_on: '2025-04-10',
    status: 'verified',
    data_origin: 'official',
    field_associated: 'claim_amount_expected',
    details: 'Indemnity calculation formula based on Threshold Yield vs Actual Yield.',
    details_hi: 'थ्रेशोल्ड उपज बनाम वास्तविक उपज पर आधारित दावा निर्धारण नियम।',
  },
  {
    rule_code: 'INS-POLICY-CERTIFICATE',
    scheme_name: 'Crop Insurance Policy Certificate',
    authority: 'Empanelled Insurer',
    document: 'Policy Schedule',
    url: null,
    effective_from: '2024-06-01',
    effective_to: null,
    last_verified_on: '2025-04-10',
    status: 'verified',
    data_origin: 'bank_document',
    field_associated: 'claim_amount_expected',
    details: 'Assessed claim indemnity: ₹30,000.00.',
  },
];

describe('BasisOfCheckCard for Insurance Claims', () => {
  it('renders official PMFBY source citation and link', () => {
    render(
      <LanguageProvider>
        <BasisOfCheckCard
          checkType="insurance"
          sources={mockSources}
          flaggedRuleCode="PMFBY-REV-GUIDELINES-2020"
          flaggedRuleThreshold="±₹100"
          flaggedRuleReasonEn="Secondary tranche pending"
          isFlagged={true}
          arithmetic={{
            crop: 'Paddy (Kharif)',
            expected: 30000,
            actual: 20000,
            difference: 10000,
          }}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/Basis of this check/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Pradhan Mantri Fasal Bima Yojana/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Ministry of Agriculture & Farmers Welfare/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View official source/i })).toHaveAttribute('href', 'https://pmfby.gov.in');
    expect(screen.getByText(/Assessed Claim Entitlement/i)).toBeInTheDocument();
    expect(screen.getByText(/Disbursement Received in Bank/i)).toBeInTheDocument();
  });

  it('renders neutral unverified banner when no official source is available', () => {
    render(
      <LanguageProvider>
        <BasisOfCheckCard
          checkType="insurance"
          sources={[]}
          flaggedRuleCode="NO_VERIFIED_RULE"
          isFlagged={true}
          arithmetic={{
            crop: 'Paddy',
            expected: 0,
            actual: 20000,
            difference: -20000,
          }}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/Official Rule Not Verified in Registry/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Official PMFBY Portal/i })).toHaveAttribute('href', 'https://pmfby.gov.in');
  });
});
