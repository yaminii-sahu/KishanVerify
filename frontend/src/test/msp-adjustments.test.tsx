import React from 'react';
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MSPAdjustmentsBreakdownCard, AdjustmentItem, QuestionItem } from '../components/MSPAdjustmentsBreakdownCard';
import { LanguageProvider } from '../context/LanguageContext';

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockAdjustments: AdjustmentItem[] = [
  {
    id: 'adj-hamali',
    category: 'hamali',
    label_en: 'Handling / Loading Charges (Hamali)',
    label_hi: 'हम्माली / उतराई शुल्क',
    amount: 625,
    rate_rule: '₹12.50 / quintal statutory APMC ceiling',
    is_statutory: true,
    is_flagged: false,
    authority: 'APMC Mandi By-Laws',
  },
  {
    id: 'adj-moisture',
    category: 'quality_cut',
    label_en: 'Moisture & FAQ Quality Cut',
    label_hi: 'नमी व गुणवत्ता कटौती (FAQ)',
    amount: 1150,
    rate_rule: '₹23.00 / quintal standard refraction cut',
    is_statutory: true,
    is_flagged: false,
    authority: 'Food Corporation of India (FCI) / CACP',
  },
  {
    id: 'adj-unexplained',
    category: 'unexplained',
    label_en: 'Unexplained Difference',
    label_hi: 'अस्पष्ट अंतर (समीक्षा आवश्यक)',
    amount: 3475,
    rate_rule: 'No corresponding statutory rule found',
    is_statutory: false,
    is_flagged: true,
    authority: 'Mandi Accounting Office',
  },
];

const mockQuestions: QuestionItem[] = [
  {
    id: 'q1',
    category: 'mandi_cess',
    target_authority: 'Mandi Secretary / APMC',
    statutory_reference: 'Chhattisgarh Krishi Upaj Mandi Adhiniyam 1972 Section 19',
    question_en: 'As per APMC Mandi Adhiniyam Section 19, mandi fees are statutory obligations of the buyer. Was any fee deducted from my payout?',
    question_hi: 'मंडी अधिनियम की धारा 19 के अनुसार क्या मेरे भुगतान से कोई मंडी शुल्क काटा गया है?',
  },
];

describe('MSPAdjustmentsBreakdownCard Component', () => {
  it('renders itemized deductions table with explained and unexplained split', () => {
    render(
      <LanguageProvider>
        <MSPAdjustmentsBreakdownCard
          grossExpected={115000}
          actualPayment={105000}
          totalDifference={10000}
          totalExplained={6525}
          unexplainedDifference={3475}
          adjustments={mockAdjustments}
          questionsToAsk={mockQuestions}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('Gross Statutory Entitlement')).toBeDefined();
    expect(screen.getByText('Handling / Loading Charges (Hamali)')).toBeDefined();
    expect(screen.getAllByText('Unexplained Difference').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/₹3,475/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders questions to ask section with copy and listen actions', () => {
    render(
      <LanguageProvider>
        <MSPAdjustmentsBreakdownCard
          grossExpected={115000}
          actualPayment={105000}
          totalDifference={10000}
          totalExplained={6525}
          unexplainedDifference={3475}
          adjustments={mockAdjustments}
          questionsToAsk={mockQuestions}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('Questions to Ask Your Procurement Centre')).toBeDefined();
    expect(screen.getByText(/Mandi Secretary \/ APMC/)).toBeDefined();
    expect(screen.getByText('Copy Question')).toBeDefined();
    expect(screen.getByText('Listen')).toBeDefined();
  });
});
