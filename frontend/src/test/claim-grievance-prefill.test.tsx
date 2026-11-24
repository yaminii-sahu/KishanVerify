import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { GrievancePage } from '../pages/GrievancePage';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';

describe('GrievancePage Prefill from Insurance Claim', () => {
  it('prefills neutral description, PMFBY claim ID, and difference amount', () => {
    const query = '?issue_type=insurance&scheme=PMFBY&claim_id=INS-2024-7711&crop=Paddy+(Kharif)&expected=30000&received=20000&difference=10000&reason_code=UNDER_REVIEW_TRANCHE';

    render(
      <MemoryRouter initialEntries={[`/farmer/grievance${query}`]}>
        <LanguageProvider>
          <AuthProvider>
            <GrievancePage />
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    const issueSelect = screen.getByRole('combobox') as HTMLSelectElement;
    expect(issueSelect.value).toBe('Insurance Claim Issue');

    const descTextarea = screen.getByPlaceholderText(/Explain the discrepancy or issue clearly/i) as HTMLTextAreaElement;
    expect(descTextarea.value).toContain('INS-2024-7711');
    expect(descTextarea.value).toContain('10,000');
    expect(descTextarea.value).toContain('PMFBY');
    expect(descTextarea.value).toContain('UNDER_REVIEW_TRANCHE');
    expect(descTextarea.value).not.toContain('fraud');
    expect(descTextarea.value).not.toContain('wrongdoing');
  });
});
