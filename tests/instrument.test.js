import { describe, expect, it } from 'vitest'

import { Instrument } from '@/lib/instrument.ts'

const Instruments = () => [
  new Instrument(10000, () => 0.11, 12, 'IRA', () => 6500),
  new Instrument(45000, () => 0.085, 12, '401(K)', () => 23500),
  new Instrument(0, () => 0.042666667, 12, 'ABC'),
]

describe('instrument module', () => {
  const [inst1, inst2, inst3] = Instruments();
  it('creates an Instrument with proper attributes', async () => {
    expect(inst1.name).toBe('IRA');
    expect(inst1.currentBalance).toBe(10000);
    expect(inst1.annualRate()).toBe(0.11);
    expect(inst1.periodicRate()).toBe(0.009166666666666667);
    expect(inst1.annualLimit()).toBe(6500);
  });

  it('defaults attributes appropriately', async () => {
    expect(inst3.annualLimit()).toBe(0);
  });

  it('validates contributions', async () => {
    expect(inst2.validateContribution(2000, 22400)).toBe(1100);
    expect(inst3.validateContribution(2000, 22400)).toBe(2000);
    expect(inst2.validateContribution(2000, 24400)).toBe(0);
    expect(() => inst1.validateContribution(-177)).toThrow('contribution of -177 must be greater than/equal to zero');
  });

  it('accrues interest', async () => {
    expect(inst2.accrueInterest()).toBe(318.75);
    expect(inst2.accrueInterest(1000)).toBe(7.083333333333334);
    expect(inst3.accrueInterest()).toBe(0);
    expect(inst3.accrueInterest(200)).toBe(0.7111111166666666);
  });
});
