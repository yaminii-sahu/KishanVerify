import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AIAssistantPage } from '../pages/AIAssistantPage';
import * as apiModule from '../services/api';

vi.mock('../services/api', async () => {
  const actual = await vi.importActual<any>('../services/api');
  return {
    ...actual,
    sendAiChatApi: vi.fn(),
    fetchAiStatusApi: vi.fn().mockResolvedValue({
      provider_configured: false,
      mode: 'offline',
      provider: 'gemini',
      model: 'gemini-1.5-flash',
    }),
  };
});

describe('AIAssistantPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends user message, language, and conversation history in the request payload', async () => {
    const sendMock = vi.mocked(apiModule.sendAiChatApi).mockResolvedValue({
      reply: 'Based on your profile, you may be eligible for PM-KISAN (₹6,000/yr).',
      reply_language: 'en',
      provider: 'template-fallback',
      mode: 'offline',
      intent: 'scheme_eligibility',
      suggested_chips: ['Required documents', 'Claim status'],
      source_documents: ['myScheme.gov.in'],
      action_link: '/farmer/schemes',
      action_label: 'View Schemes',
    });

    render(
      <MemoryRouter>
        <AIAssistantPage />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Type or speak a question|यहाँ अपना प्रश्न लिखें/i);
    fireEvent.change(input, { target: { value: 'which scheme am i eligible for' } });

    const form = input.closest('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(sendMock).toHaveBeenCalledTimes(1);
    });

    const [msg, lang, farmerId, history] = sendMock.mock.calls[0];
    expect(msg).toBe('which scheme am i eligible for');
    expect(lang).toBeDefined();
    expect(farmerId).toBeDefined();
    expect(history).toBeDefined();
    expect(history!.length).toBeGreaterThanOrEqual(1);
  });

  it('renders two different questions with two distinct responses and mode indicators', async () => {
    vi.mocked(apiModule.sendAiChatApi)
      .mockResolvedValueOnce({
        reply: 'Namaste Ramesh Kumar! Welcome to KisanVerify. How can I help you today?',
        reply_language: 'en',
        provider: 'template-fallback',
        mode: 'offline',
        intent: 'greeting',
        suggested_chips: ['Eligible schemes', 'Loan difference'],
        source_documents: ['KisanVerify Citizen Guide'],
      })
      .mockResolvedValueOnce({
        reply: 'Your KCC loan record has a ₹10,000 difference flagged for review.',
        reply_language: 'en',
        provider: 'template-fallback',
        mode: 'offline',
        intent: 'loan_status',
        suggested_chips: ['Required documents', 'MSP status'],
        source_documents: ['SBI Sanction Letter'],
        action_link: '/farmer/loan-verify',
        action_label: 'View Loan Details',
      });

    render(
      <MemoryRouter>
        <AIAssistantPage />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Type or speak a question|यहाँ अपना प्रश्न लिखें/i);
    const form = input.closest('form')!;

    // Question 1: "hlo"
    fireEvent.change(input, { target: { value: 'hlo' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Namaste Ramesh Kumar! Welcome to KisanVerify/i)).toBeTruthy();
    });

    // Question 2: "what is the status of my loan"
    fireEvent.change(input, { target: { value: 'what is the status of my loan' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Your KCC loan record has a ₹10,000 difference flagged/i)).toBeTruthy();
    });

    // Verify mode indicator is present on rendered messages
    const modeBadges = screen.getAllByText(/Answered by: Offline mode/i);
    expect(modeBadges.length).toBeGreaterThanOrEqual(2);

    // Verify action button for loan details is rendered
    expect(screen.getByText(/View Loan Details/i)).toBeTruthy();
  });
});
