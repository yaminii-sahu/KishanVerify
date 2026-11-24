import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClaimTimelineView } from '../components/ClaimTimelineView';
import { LanguageProvider } from '../context/LanguageContext';
import { ClaimTimelineResponse } from '../services/api';

const mockTimeline: ClaimTimelineResponse = {
  claim_id: 1,
  insurance_ref: 'INS-2024-7711',
  crop: 'Paddy (Kharif)',
  season: 'Kharif 2024',
  state: 'Chhattisgarh',
  district: 'Durg',
  insured_area_hectares: 2.0,
  sum_insured: 80000,
  assessed_loss_percentage: 37.5,
  claim_amount_calculated: 30000,
  amount_received: 20000,
  difference: 10000,
  claim_status: 'Under Review',
  last_status_date: '2024-11-05',
  days_in_current_stage: 28,
  threshold_days: 21,
  is_delayed: true,
  delay_notice_en: 'Review period (28 days elapsed) exceeds standard 21-day PMFBY window.',
  delay_notice_hi: 'समीक्षा अवधि (28 दिन बीत चुके हैं) पीएमएफबीवाई की मानक 21 दिनों की समय सीमा से अधिक है।',
  current_stage: 'Secondary Tranche / State Subsidy Reconciliation Under Review',
  current_stage_hi: 'द्वितीय किश्त एवं राज्य सब्सिडी समायोजन समीक्षाधीन',
  missing_events_count: 1,
  events: [
    {
      id: 1,
      event_type: 'policy_enrolled',
      date: '2024-07-15',
      amount: 1600,
      description_en: 'Policy enrolled under PMFBY Kharif 2024 with 2% statutory farmer premium of ₹1,600.',
      description_hi: 'पॉलिसी नामांकित 2% प्रीमियम ₹1,600 के साथ।',
      source: 'PMFBY National Portal',
      data_origin: 'official',
      is_missing_placeholder: false,
      is_current_stage: false,
    },
    {
      id: 2,
      event_type: 'loss_intimated',
      date: '2024-09-12',
      amount: null,
      description_en: 'Crop inundation loss intimated within 72-hour window.',
      description_hi: 'फसल नुकसान सूचना दर्ज।',
      source: 'Crop Insurance App',
      data_origin: 'user_entered',
      is_missing_placeholder: false,
      is_current_stage: false,
    },
    {
      id: null,
      event_type: 'amount_credited',
      date: 'Date Pending',
      amount: 10000,
      description_en: 'Secondary tranche credit advice for remaining ₹10,000 pending administrative release.',
      description_hi: 'शेष ₹10,000 के लिए द्वितीय किश्त डीबीटी सूचना लंबित।',
      source: 'PMFBY State Clearing Portal',
      data_origin: 'official',
      is_missing_placeholder: true,
      is_current_stage: true,
    },
  ],
};

describe('ClaimTimelineView', () => {
  it('renders claim timeline header, crop and ref', () => {
    render(
      <LanguageProvider>
        <ClaimTimelineView initialTimeline={mockTimeline} />
      </LanguageProvider>
    );

    expect(screen.getByText(/Claim Progress & Status Timeline/i)).toBeInTheDocument();
    expect(screen.getByText(/INS-2024-7711/i)).toBeInTheDocument();
    expect(screen.getByText(/Paddy \(Kharif\)/i)).toBeInTheDocument();
  });

  it('renders delay warning banner when is_delayed is true', () => {
    render(
      <LanguageProvider>
        <ClaimTimelineView initialTimeline={mockTimeline} />
      </LanguageProvider>
    );

    expect(screen.getByText(/Settlement may be delayed/i)).toBeInTheDocument();
    expect(screen.getAllByText(/28 days elapsed/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/PMFBY Helpline: 14447/i)).toBeInTheDocument();
  });

  it('renders events and missing step placeholder with distinct badge', () => {
    render(
      <LanguageProvider>
        <ClaimTimelineView initialTimeline={mockTimeline} />
      </LanguageProvider>
    );

    expect(screen.getAllByText(/Policy Enrolled/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Pending Final Tranche Release/i)).toBeInTheDocument();
    expect(screen.getByText(/Date Pending/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Official Portal/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Farmer Intimation/i)).toBeInTheDocument();
  });
});
