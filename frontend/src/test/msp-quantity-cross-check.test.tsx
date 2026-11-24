import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MSPQuantityCrossCheckCard } from '../components/MSPQuantityCrossCheckCard';
import { LanguageProvider } from '../context/LanguageContext';

describe('MSPQuantityCrossCheckCard Component', () => {
  it('renders multi-source quantity cards and displays discrepancy with calculated monetary impact', async () => {
    render(
      <LanguageProvider>
        <MSPQuantityCrossCheckCard
          farmerQuantity={50.0}
          mspRate={2300.0}
          weightSlipQuantity={50.0}
          portalQuantity={48.0}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('Multi-Source Quantity Cross-Check')).toBeDefined();
    expect(screen.getByText('Farmer Claimed Delivery')).toBeDefined();
    expect(screen.getByText('Weighbridge Electronic Slip')).toBeDefined();
    expect(screen.getByText('e-Uparjan Civil Supplies Portal')).toBeDefined();

    // Check discrepancy and monetary impact (2.0 qtl * 2300 = ₹4,600)
    expect(await screen.findByText('Weight Variance Detected Across Records')).toBeDefined();
    expect(screen.getAllByText(/4,600/).length).toBeGreaterThanOrEqual(1);
  });

  it('switches between Quintals and Kilograms with transparent unit conversion', async () => {
    render(
      <LanguageProvider>
        <MSPQuantityCrossCheckCard
          farmerQuantity={50.0}
          mspRate={2300.0}
          weightSlipQuantity={50.0}
          portalQuantity={50.0}
        />
      </LanguageProvider>
    );

    const kgButton = screen.getByText('Kilograms (Kg)');
    fireEvent.click(kgButton);

    const kgElements = await screen.findAllByText(/5,000 kg/);
    expect(kgElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/1 Quintal = 100 Kilograms/)).toBeDefined();
  });
});
