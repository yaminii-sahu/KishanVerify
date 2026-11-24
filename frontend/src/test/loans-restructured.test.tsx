import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { LoanProductsTab } from '../components/LoanProductsTab';
import { MyLoansTab } from '../components/MyLoansTab';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';

describe('Restructured Loan Section Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Loans I Can Apply For with products, eligibility badges and statutory citations', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <LoanProductsTab />
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Check informational banner
    expect(screen.getByText(/Informational Eligibility/i)).toBeInTheDocument();

    // Check KCC and Tractor loan products appear
    await waitFor(() => {
      expect(screen.getByText(/Kisan Credit Card \(KCC\) Crop Loan/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Farm Mechanization/i).length).toBeGreaterThan(0);
    });

    // Check eligibility badges appear (Likely Eligible / Docs Needed)
    const likelyBadges = screen.getAllByText(/Likely eligible/i);
    expect(likelyBadges.length).toBeGreaterThan(0);

    // Check that words like "guaranteed" or "approved" do not exist in eligibility labels
    expect(screen.queryByText(/Approved by Bank/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Guaranteed Sanction/i)).not.toBeInTheDocument();
  });

  it('renders My Loans with Verified, Needs Review and Not Verified records and reason blocks', async () => {
    const handleCheckNew = vi.fn();

    render(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <MyLoansTab onCheckNewLoan={handleCheckNew} />
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Check title and Action button
    expect(screen.getByText(/My Existing Agricultural Loans/i)).toBeInTheDocument();
    const newBtn = screen.getByText(/Check a New Loan \/ Upload/i);
    expect(newBtn).toBeInTheDocument();
    fireEvent.click(newBtn);
    expect(handleCheckNew).toHaveBeenCalled();

    // Check loan records are loaded
    await waitFor(() => {
      expect(screen.getByText(/LN-2024-8812/i)).toBeInTheDocument();
      expect(screen.getByText(/LN-2023-4102/i)).toBeInTheDocument();
      expect(screen.getByText(/LN-2024-9943/i)).toBeInTheDocument();
    });

    // Check verification status badges
    expect(screen.getAllByText(/Needs Review/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Not Verified/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Verified/i).length).toBeGreaterThan(0);

    // Check Reason Codes
    expect(screen.getByText(/DISBURSEMENT_MISMATCH/i)).toBeInTheDocument();
    expect(screen.getByText(/MISSING_SANCTION_DOC/i)).toBeInTheDocument();
  });
});
