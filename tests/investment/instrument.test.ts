import { describe, expect, it } from 'vitest'

import { Instrument } from '@/lib/investment/instrument';

const Instruments = (): Instrument[] => [
  new Instrument(10000, 0.11, 12, 'IRA', 6500),
  new Instrument(45000, 0.085, 12, '401(K)', 23500),
  new Instrument(0, 0.042666667, 12, 'ABC'),
];

describe('instrument module', () => {
  const [inst1, inst2, inst3] = Instruments();
  it('creates an Instrument with proper attributes', async () => {
    expect(inst1.name).toBe('IRA');
    expect(inst1.currentBalance).toBe(10000);
    expect(inst1.annualRate).toBe(0.11);
    expect(inst1.periodicRate).toBeCloseTo(0.009166, 5);
    expect(inst1.periodicContribution()).toBeCloseTo(541.666666, 5);
    expect(inst1.annualLimit).toBe(6500);
  });

  it('defaults attributes appropriately', async () => {
    expect(inst3.annualLimit).toBe(0);
    expect(inst3.periodicContribution()).toBe(0);
  });

  it('validates contributions', async () => {
    const negativeContribution = -177;
    expect(inst2.validateContribution(2000, 22400)).toBe(1100);
    expect(inst3.validateContribution(2000, 22400)).toBe(2000);
    expect(inst2.validateContribution(2000, 24400)).toBe(0);
    expect(() => inst1.validateContribution(negativeContribution, 2000)).toThrow(`contribution of ${negativeContribution} must be greater than/equal to zero`);
  });

  it('accrues interest', async () => {
    expect(inst2.accrueInterest()).toBe(318.75);
    expect(inst2.accrueInterest(1000)).toBeCloseTo(7.083333, 5);
    expect(inst3.accrueInterest()).toBe(0);
    expect(inst3.accrueInterest(200)).toBeCloseTo(0.711111, 5);
  });
  describe('instrument module - drawdown methods', () => {
    const testInstrument = new Instrument(10000, 0.06, 12, 'Test Acc');

    it('calculates periods to zero (numWithdrawalsToZero)', () => {
      // Covers instrument.ts lines 87-95
      const periods = testInstrument.numWithdrawalsToZero(500);
      expect(periods).toBe(22);
    });

    it('calculates maximum sustainable withdrawal (calculateMaxWithdrawal)', () => {
      // Covers instrument.ts lines 105-113
      const maxWithdrawal = testInstrument.calculateMaxWithdrawal(12);
      expect(maxWithdrawal).toBeCloseTo(860.66, 2);
    });
  });
});
