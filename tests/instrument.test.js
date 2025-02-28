import { describe, expect, it } from 'vitest'

import { Instrument } from '@/lib/instrument.ts'

const Instruments = () => [
  new Instrument(10000, () => 0.11, 12, 'IRA', () => 6500),
  new Instrument(45000, () => 0.0085, 12, '401(K)', () => 23500),
  new Instrument(0, 1.04, 12, 'House'),
]

describe('instrument module', () => {
  const [inst1, inst2, inst3] = Instruments();
  it('creates an Instrument with proper attributes', async () => {
    expect(inst1.name).toBe('IRA');
    expect(inst1.currentBalance).toBe(10000);
    expect(inst1.annualRate()).toBe(0.11);
    expect(inst1.annualLimit()).toBe(6500);
  });

  it('defaults attributes appropriately', async () => {
    expect(inst3.annualLimit()).toBe(0);
  });
});
