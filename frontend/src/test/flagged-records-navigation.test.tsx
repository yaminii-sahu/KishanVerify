import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { FarmerLayout } from '../layouts/FarmerLayout';
import { FarmerHomePage } from '../pages/FarmerHomePage';
import { LoanVerificationPage } from '../pages/LoanVerificationPage';
import { MSPVerificationPage } from '../pages/MSPVerificationPage';
import { LoginPage } from '../pages/LoginPage';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Mock confetti and browser canvas
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Mock API calls
vi.mock('../services/api', () => ({
  fetchFarmerAttentionApi: vi.fn().mockResolvedValue({
    farmer_id: 'FV12345',
    farmer_name: 'Ramesh Kumar',
    count: 2,
    has_discrepancies: true,
    items: [
      {
        record_type: 'Loan',
        record_ref: 'LN-2024-8812',
        title: 'KCC Loan (State Bank of India)',
        title_hi: 'केसीसी ऋण (State Bank of India)',
        difference: 10000,
        status: 'Needs Review',
        link: '/farmer/loan-verify?recordId=LN-2024-8812',
      },
      {
        record_type: 'MSP',
        record_ref: 'MSP-2024-4411',
        title: 'MSP Payment (Paddy)',
        title_hi: 'एमएसपी भुगतान (धान)',
        difference: 10000,
        status: 'Needs Review',
        link: '/farmer/msp-verify?recordId=MSP-2024-4411',
      },
    ],
  }),
  fetchWeatherApi: vi.fn().mockResolvedValue(null),
  fetchDocumentsApi: vi.fn().mockResolvedValue({ documents: [] }),
  extractLoanOcrApi: vi.fn(),
  verifyLoanApi: vi.fn().mockResolvedValue({
    is_flagged: true,
    status: 'Needs Review',
    status_label: 'Discrepancy Detected',
    approved_amount: 80000,
    disbursed_amount: 70000,
    deductions: 5000,
    difference: 10000,
    unaccounted_difference: 5000,
    sources: [],
  }),
  verifyMspApi: vi.fn().mockResolvedValue({
    is_flagged: true,
    status: 'Needs Review',
    status_label: 'Payment Discrepancy Detected',
    crop: 'Paddy (Common)',
    quantity_quintals: 50,
    msp_rate: 2300,
    expected_payment: 115000,
    actual_payment: 105000,
    difference: 10000,
    sources: [],
  }),
  fetchVerificationRecordByRefApi: vi.fn().mockImplementation((ref: string) => {
    if (ref.includes('8812') || ref.includes('LN')) {
      return Promise.resolve({
        record_type: 'loan',
        record_ref: ref,
        data: {
          bank_name: 'State Bank of India',
          loan_account_ref: ref,
          loan_type: 'Crop Loan (KCC)',
          approved_amount: 80000,
          disbursed_amount: 70000,
          interest_rate: 7.5,
          deductions: 5000,
          loan_date: '12-03-2024',
        },
        verification: null,
      });
    }
    return Promise.resolve({
      record_type: 'msp',
      record_ref: ref,
      data: {
        crop: 'Paddy (Common)',
        quantity: 50,
        msp_rate: 2300,
        actual_payment: 105000,
        procurement_center: 'Patan Krishi Upaj Mandi',
        payment_date: '05-04-2024',
      },
      verification: null,
    });
  }),
}));

const TestApp: React.FC<{ initialEntries?: string[] }> = ({ initialEntries = ['/farmer'] }) => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/farmer" element={<FarmerLayout />}>
              <Route index element={<FarmerHomePage />} />
              <Route path="loan-verify" element={<LoanVerificationPage />} />
              <Route path="loan" element={<LoanVerificationPage />} />
              <Route path="msp-verify" element={<MSPVerificationPage />} />
              <Route path="msp" element={<MSPVerificationPage />} />
            </Route>
            <Route
              path="/protected-test"
              element={
                <ProtectedRoute requiredRole="farmer">
                  <div data-testid="protected-content">Protected Farmer Secret</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </LanguageProvider>
  );
};

describe('Flagged Records Verification and Navigation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('logged-in user clicks "Verify" on Loan item -> lands on Loan Verification page with record prefilled (NOT /login)', async () => {
    render(<TestApp initialEntries={['/farmer']} />);

    // Wait for the attention records to load on home page
    const viewDetailsBtn = await screen.findByRole('button', { name: /view details/i });
    expect(viewDetailsBtn).toBeInTheDocument();

    // Click "View Details" to expand flagged records
    fireEvent.click(viewDetailsBtn);

    // Find the loan verify button
    const verifyButtons = await screen.findAllByRole('button', { name: /verify/i });
    expect(verifyButtons.length).toBeGreaterThanOrEqual(2);

    // Click the first Verify button (Loan item)
    fireEvent.click(verifyButtons[0]);

    // Should navigate to Loan Verification page, NOT login page
    await waitFor(() => {
      expect(screen.queryByText(/demo: farmer login/i)).not.toBeInTheDocument();
      expect(screen.getAllByText(/loan verification/i).length).toBeGreaterThan(0);
      // Record ID should be loaded and present
      expect(screen.getByDisplayValue(/LN-2024-8812/i)).toBeInTheDocument();
    });
  });

  it('logged-in user clicks "Verify" on MSP item -> lands on MSP Verification page with record prefilled', async () => {
    render(<TestApp initialEntries={['/farmer']} />);

    const viewDetailsBtn = await screen.findByRole('button', { name: /view details/i });
    fireEvent.click(viewDetailsBtn);

    const verifyButtons = await screen.findAllByRole('button', { name: /verify/i });
    expect(verifyButtons.length).toBeGreaterThanOrEqual(2);

    // Click the second Verify button (MSP item)
    fireEvent.click(verifyButtons[1]);

    await waitFor(() => {
      expect(screen.queryByText(/demo: farmer login/i)).not.toBeInTheDocument();
      expect(screen.getAllByText(/msp/i).length).toBeGreaterThan(0);
      expect(screen.getByDisplayValue(/Patan Krishi Upaj Mandi/i)).toBeInTheDocument();
    });
  });

  it('browser refresh on verification page restores session from localStorage and keeps user logged in', async () => {
    // Set localStorage as if a previous session existed
    localStorage.setItem('kisanverify_user_role', 'farmer');
    localStorage.setItem('kisanverify_authenticated', 'true');
    localStorage.setItem(
      'kisanverify_user',
      JSON.stringify({
        id: 'u-1',
        name: 'Ramesh Kumar',
        phone: '+91 98765 43210',
        role: 'farmer',
        farmerId: 'FV12345',
      })
    );

    // Mount directly on loan verify route with recordId
    render(<TestApp initialEntries={['/farmer/loan-verify?recordId=LN-2024-8812']} />);

    await waitFor(() => {
      expect(screen.getAllByText(/loan verification/i).length).toBeGreaterThan(0);
      expect(screen.queryByText(/demo: farmer login/i)).not.toBeInTheDocument();
    });
  });

  it('alias route /farmer/loan?recordId=... directly mounts LoanVerificationPage without redirecting to login', async () => {
    render(<TestApp initialEntries={['/farmer/loan?recordId=LN-2024-8812']} />);

    await waitFor(() => {
      expect(screen.getAllByText(/loan verification/i).length).toBeGreaterThan(0);
      expect(screen.queryByText(/demo: farmer login/i)).not.toBeInTheDocument();
    });
  });

  it('unauthenticated user visiting protected route redirects to /login and returns to destination after login', async () => {
    // Simulate unauthenticated state
    localStorage.setItem('kisanverify_authenticated', 'false');

    render(<TestApp initialEntries={['/protected-test']} />);

    // Should redirect to login page
    await waitFor(() => {
      expect(screen.getByText(/1-click quick demo/i)).toBeInTheDocument();
    });

    // Click "Launch" to log in
    const launchBtn = screen.getByRole('button', { name: /launch/i });
    fireEvent.click(launchBtn);

    // Should return to the original destination (/protected-test)
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });
});
