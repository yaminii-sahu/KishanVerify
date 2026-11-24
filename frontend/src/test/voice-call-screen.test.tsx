import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { VoiceCallModal } from '../components/VoiceCallModal';
import { ContactPage } from '../pages/ContactPage';
import { FarmerHomePage } from '../pages/FarmerHomePage';
import * as apiModule from '../services/api';

vi.mock('../services/api', async () => {
  const actual = await vi.importActual<any>('../services/api');
  return {
    ...actual,
    sendVoiceTurnApi: vi.fn(),
    recordVoiceConsentApi: vi.fn().mockResolvedValue({ status: 'Recorded' }),
    fetchHelplinesApi: vi.fn().mockResolvedValue([
      {
        id: 'hl-kisan-call-center',
        name_en: 'Kisan Call Centre (KCC)',
        name_hi: 'किसान कॉल सेंटर',
        toll_free_number: '1800-180-1551',
        category: 'Agri Advisory',
        operating_hours_en: '6:00 AM to 10:00 PM (All 7 Days)',
        operating_hours_hi: 'सुबह 6:00 से रात 10:00 तक',
        description_en: 'Nationwide toll-free telephone service for queries.',
        description_hi: 'किसानों के प्रश्नों के लिए राष्ट्रीय टोल-फ्री सेवा।',
        official_portal_url: 'https://dacc.gov.in',
        source_verified: true,
      },
    ]),
    fetchFarmerAttentionApi: vi.fn().mockResolvedValue({
      count: 2,
      has_discrepancies: true,
      items: [
        {
          record_type: 'loan',
          record_ref: 'LN-2024-8812',
          title: 'KCC Crop Loan Discrepancy',
          difference: 10000,
          status: 'Flagged for Review',
          link: '/farmer/loan-verify',
        },
      ],
    }),
    fetchWeatherApi: vi.fn().mockResolvedValue(null),
  };
});

describe('Voice Call Support Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders VoiceCallModal with AI disclosure banner and initial greeting', () => {
    render(
      <MemoryRouter>
        <VoiceCallModal isOpen={true} onClose={vi.fn()} language="hi" />
      </MemoryRouter>
    );

    // AI Disclosure banner
    expect(screen.getByText(/कृत्रिम बुद्धिमत्ता \(AI\) सहायता/i)).toBeTruthy();

    // Initial greeting
    expect(screen.getByText(/नमस्ते रमेश कुमार जी/i)).toBeTruthy();

    // End call button
    expect(screen.getByTitle(/कॉल समाप्त करें/i)).toBeTruthy();
  });

  it('triggers sendVoiceTurnApi and displays synchronized loan action card on inquiry', async () => {
    vi.mocked(apiModule.sendVoiceTurnApi).mockResolvedValue({
      session_id: 'test-sess-1',
      agent_speech_text: 'आपके एसबीआई केसीसी ऋण में स्वीकृत राशि ₹80,000 और वितरित ₹70,000 है। कुल ₹10,000 के अंतर में ₹5,000 अव्याख्यायित है।',
      agent_speech_phonetic: 'आपके एसबीआई केसीसी ऋण में स्वीकृत राशि अस्सी हज़ार रुपये...',
      language: 'hi',
      tool_called: 'get_loan_status',
      action_card: {
        type: 'loan_card',
        title: 'KCC Loan Verification',
        approved: 80000,
        disbursed: 70000,
        difference: 10000,
        unexplained: 5000,
        link: '/farmer/loan-verify',
      },
      confirmation_requested: false,
      suggested_quick_phrases: ['Raise a grievance', 'Mandi price'],
      mode: 'offline',
      provider: 'deterministic-rule-engine',
    });

    render(
      <MemoryRouter>
        <VoiceCallModal isOpen={true} onClose={vi.fn()} language="hi" />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/या यहाँ टाइप करें/i);
    fireEvent.change(input, { target: { value: 'ऋण का अंतर क्या है?' } });

    const form = input.closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(apiModule.sendVoiceTurnApi).toHaveBeenCalledTimes(1);
    });

    // Check that loan card was rendered
    await waitFor(() => {
      expect(screen.getByText('KCC Loan Verification')).toBeTruthy();
      expect(screen.getAllByText(/अव्याख्यायित/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders verbal confirmation buttons when confirmation_requested is true', async () => {
    vi.mocked(apiModule.sendVoiceTurnApi).mockResolvedValue({
      session_id: 'test-sess-conf',
      agent_speech_text: 'क्या आप ऋण अंतर के लिए आधिकारिक शिकायत दर्ज कराना चाहते हैं?',
      agent_speech_phonetic: 'क्या आप ऋण अंतर के लिए...',
      language: 'hi',
      tool_called: 'raise_grievance',
      confirmation_requested: true,
      confirmation_action: {
        action: 'raise_grievance',
        record_ref: 'LN-2024-8812',
      },
      suggested_quick_phrases: ['हाँ', 'ना'],
      mode: 'offline',
      provider: 'tool-executor',
    });

    render(
      <MemoryRouter>
        <VoiceCallModal isOpen={true} onClose={vi.fn()} language="hi" />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/या यहाँ टाइप करें/i);
    fireEvent.change(input, { target: { value: 'शिकायत दर्ज करनी है' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/कार्रवाई की पुष्टि आवश्यक है/i)).toBeTruthy();
      expect(screen.getByText(/हाँ, दर्ज करें \(Yes\)/i)).toBeTruthy();
      expect(screen.getByText(/नहीं, रहने दें \(No\)/i)).toBeTruthy();
    });
  });

  it('renders Call Support button in ContactPage and opens modal on click', async () => {
    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    );

    const callSupportBtn = screen.getByText(/Call Support Now|अभी कॉल करें/i);
    expect(callSupportBtn).toBeTruthy();

    fireEvent.click(callSupportBtn);

    // Modal opens
    await waitFor(() => {
      expect(screen.getByText(/AI ASSISTANT/i)).toBeTruthy();
    });
  });

  it('renders Call Support button in FarmerHomePage', () => {
    render(
      <MemoryRouter>
        <FarmerHomePage />
      </MemoryRouter>
    );

    const callBtns = screen.getAllByText(/कॉल सहायता|Call Support/i);
    expect(callBtns.length).toBeGreaterThanOrEqual(1);
  });
});
