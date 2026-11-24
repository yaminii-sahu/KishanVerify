import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MSPTimelineView } from '../components/MSPTimelineView';
import { LanguageProvider } from '../context/LanguageContext';
import { MSPTimelineResponse } from '../services/api';

const mockMspTimeline: MSPTimelineResponse = {
  record_id: 1,
  record_ref: 'MSP-2024-4411',
  crop: 'Paddy (Common)',
  variety_grade: 'Common',
  season: 'Kharif 2024-25',
  year: '2024',
  state: 'Chhattisgarh',
  procurement_center: 'Patan Krishi Upaj Mandi',
  farmer_reg_id_masked: 'CG-KRY-****891',
  receipt_no_masked: 'REC-PTN-****441',
  quantity_quintals: 50.0,
  msp_rate: 2300.0,
  expected_payment: 115000.0,
  actual_payment: 105000.0,
  difference: 10000.0,
  status: 'Needs Review',
  payment_date: '05-04-2024',
  days_since_procurement: 24,
  threshold_days: 14,
  is_delayed: true,
  delay_days: 10,
  delay_notice_en:
    'Payment reconciliation period (24 days elapsed) exceeds standard 14-day statutory mandate.',
  delay_notice_hi:
    'भुगतान समाधान अवधि (24 दिन बीत चुके हैं) वैधानिक 14 दिनों की मानक सीमा से अधिक है।',
  current_stage: 'Itemized Deductions & Final Settlement Under Review',
  current_stage_hi: 'मदवार कटौतियां एवं अंतिम निपटान समीक्षाधीन',
  missing_events_count: 1,
  events: [
    {
      id: 1,
      event_type: 'registered',
      date: '2024-03-10',
      amount: null,
      quantity: null,
      description_en: 'Farmer registered for Kharif Paddy procurement on CG e-Uparjan portal.',
      description_hi: 'छत्तीसगढ़ ई-उपार्जन पोर्टल पर किसान पंजीयन दर्ज।',
      source: 'Chhattisgarh e-Uparjan Food Portal',
      data_origin: 'official',
      is_missing_placeholder: false,
      is_current_stage: false,
    },
    {
      id: 2,
      event_type: 'produce_delivered',
      date: '2024-03-22',
      amount: null,
      quantity: 50.0,
      description_en: '50.00 quintals of Paddy delivered at Patan Mandi.',
      description_hi: 'पाटन मंडी में 50 क्विंटल धान की आवक।',
      source: 'Mandi Entry Gate Pass',
      data_origin: 'procurement_record',
      is_missing_placeholder: false,
      is_current_stage: false,
    },
    {
      id: 7,
      event_type: 'payment_credited',
      date: '2024-04-05',
      amount: 105000.0,
      quantity: null,
      description_en: 'Net payment of ₹1,05,000 credited to farmer SBI Account *1234.',
      description_hi: '₹1,05,000 की राशि किसान के बैंक खाते में जमा।',
      source: 'Bank DBT Credit Scroll',
      data_origin: 'bank_document',
      is_missing_placeholder: false,
      is_current_stage: false,
    },
    {
      id: null,
      event_type: 'payment_credited',
      date: 'Date Pending',
      amount: 10000.0,
      quantity: null,
      description_en: 'Final reconciliation and release of remaining ₹10,000 pending audit.',
      description_hi: 'शेष ₹10,000 का अंतिम समायोजन लंबित।',
      source: 'e-Uparjan Settlement Portal',
      data_origin: 'official',
      is_missing_placeholder: true,
      is_current_stage: true,
    },
  ],
};

describe('MSPTimelineView Component', () => {
  it('renders procurement timeline header, receipt number and procurement centre', () => {
    render(
      <LanguageProvider>
        <MSPTimelineView initialTimeline={mockMspTimeline} />
      </LanguageProvider>
    );

    expect(screen.getByText('Procurement-to-Payment Timeline')).toBeDefined();
    expect(screen.getByText(/REC-PTN-\*\*\*\*441/)).toBeDefined();
    expect(screen.getByText(/Patan Krishi Upaj Mandi/)).toBeDefined();
  });

  it('displays delay warning banner when is_delayed is true with statutory threshold', () => {
    render(
      <LanguageProvider>
        <MSPTimelineView initialTimeline={mockMspTimeline} />
      </LanguageProvider>
    );

    expect(screen.getByText('Settlement may be delayed')).toBeDefined();
    expect(screen.getAllByText(/24 days elapsed/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/1800-180-1551/)).toBeDefined();
  });

  it('renders chronological milestone events and pending missing placeholder', () => {
    render(
      <LanguageProvider>
        <MSPTimelineView initialTimeline={mockMspTimeline} />
      </LanguageProvider>
    );

    expect(screen.getByText('2024-03-10')).toBeDefined();
    expect(screen.getByText('2024-03-22')).toBeDefined();
    expect(screen.getByText('Date Pending')).toBeDefined();
    expect(screen.getByText(/Pending: ₹10,000/)).toBeDefined();
  });
});
