import { describe, it, expect } from 'vitest';
import { generateClientAudioScript } from '../utils/audioScriptGenerator';

describe('generateClientAudioScript for Insurance Claims', () => {
  it('generates Hindi audio script for insurance shortfall/review', () => {
    const res = generateClientAudioScript({
      checkType: 'insurance',
      language: 'hi',
      crop: 'Paddy (Kharif)',
      expectedPayment: 30000,
      actualPayment: 20000,
      difference: 10000,
    });

    expect(res.fullText).toContain('प्रधानमंत्री फसल बीमा दावे की जांच पूरी हो गई है');
    expect(res.fullText).toContain('तीस हज़ार रुपये');
    expect(res.fullText).toContain('बीस हज़ार रुपये');
    expect(res.fullText).toContain('दस हज़ार रुपये');
    expect(res.fullText).toContain('14447');
    expect(res.isFlagged).toBe(true);
    expect(res.sentences.length).toBeGreaterThan(3);
  });

  it('generates English audio script for settled insurance claim', () => {
    const res = generateClientAudioScript({
      checkType: 'insurance',
      language: 'en',
      crop: 'Paddy (Kharif)',
      expectedPayment: 30000,
      actualPayment: 30000,
      difference: 0,
    });

    expect(res.fullText).toContain('Pradhan Mantri Fasal Bima Yojana claim verification');
    expect(res.fullText).toContain('thirty thousand rupees');
    expect(res.fullText).toContain('fully settled and verified');
    expect(res.isFlagged).toBe(false);
  });
});
