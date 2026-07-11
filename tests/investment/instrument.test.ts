import { describe, expect, it } from 'vitest';
import { Instrument } from '../../src/lib/investment/instrument';

const Instruments = (): Instrument[] => [
  new Instrument(10000_00n, 110000n, 12, 'IRA', 6500_00n),
  new Instrument(45000_00n, 85000n, 12, '401(K)', 23500_00n),
  new Instrument(0n, 42667n, 12, 'ABC'),
];

describe('instrument module', () => {
  const [inst1, inst2, inst3] = Instruments();

  it('creates an Instrument with proper attributes', async () => {
    expect(inst1.name).toBe('IRA');
    expect(inst1.currentBalance).toBe(10000_00n);
    expect(inst1.annualRate).toBe(110000n);
    expect(inst1.periodicRate).toBeCloseTo(0.11/12);
    expect(inst1.periodicContribution()).toBe(541_67n); // $541.67
    expect(inst1.annualLimit).toBe(6500_00n);
  });

  it('defaults attributes appropriately', async () => {
    expect(inst3.annualLimit).toBe(0n);
    expect(inst3.periodicContribution()).toBe(0n);
  });

  it('validates contributions', async () => {
    const negativeContribution = -177_00n;
    expect(inst2.validateContribution(2000_00n, 22400_00n)).toBe(1100_00n);
    expect(inst3.validateContribution(2000_00n, 22400_00n)).toBe(2000_00n);
    expect(inst2.validateContribution(2000_00n, 24400_00n)).toBe(0n);
    expect(() => inst1.validateContribution(negativeContribution, 2000_00n)).toThrow(`contribution of ${negativeContribution} must be greater than/equal to zero`);
  });

  it('accrues interest', async () => {
    expect(inst2.accrueInterest()).toBe(318_75n); // $318.75
    expect(inst2.accrueInterest(1000_00n)).toBe(7_08n); // $7.08
    expect(inst3.accrueInterest()).toBe(0n);
    expect(inst3.accrueInterest(200_00n)).toBe(71n); // $0.71
  });

  describe('instrument module - drawdown methods', () => {
    const testInstrument = new Instrument(10000_00n, 60000n, 12, 'Test Acc');

    it('calculates periods to zero (numWithdrawalsToZero)', () => {
      const periods = testInstrument.numWithdrawalsToZero(500_00n);
      expect(periods).toBe(22);
    });

    it('calculates maximum sustainable withdrawal (calculateMaxWithdrawal)', () => {
      const maxWithdrawal = testInstrument.calculateMaxWithdrawal(12);
      expect(maxWithdrawal).toBe(860_66n); // $860.66
    });
  });
});
