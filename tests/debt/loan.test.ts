import { describe, expect, it } from 'vitest';
import { Loan } from '../../src/lib/debt/loan';

const Loans = (): Loan[] => [
  new Loan(7500_00n, 68000n, 12, 10, 'Student Loan'),
  new Loan(150000_00n, 62200n, 12, 15, 'Mortgage', 75000_00n, 1000_00n),
  new Loan(18300_00n, 0n, 12, 4, 'Car'),
];

function expectPaymentTooLow(fn: () => void, min: bigint, val: bigint) {
  expect(fn).toThrow(`payment of ${val} cannot be less than ${min}`);
}

describe('loan module', () => {
  const [loan1, mortgage, zeroRateLoan] = Loans();

  it('creates a Loan with proper attributes', async () => {
    expect(loan1.name).toBe('Student Loan');
    expect(loan1.principal).toBe(7500_00n);
    expect(loan1.annualRate).toBe(68000n);
    expect(loan1.periodicRate).toBeCloseTo(0.068/12);
    expect(loan1.periods).toBe(120);
    expect(loan1.minPayment).toBe(86_32n); // $86.32
    expect(loan1.currentBalance).toBe(7500_00n);
    expect(loan1.fees).toBe(0n);
  });

  it('creates a Loan with working methods', async () => {
    expect(loan1.numPaymentsToZero()).toBe(120);
    expect(loan1.numPaymentsToZero(300_00n)).toBe(28); // $300.00
    expectPaymentTooLow(() => loan1.numPaymentsToZero(30_00n), loan1.minPayment, 30_00n);

    expect(loan1.validatePayment(100_00n)).toBe(100_00n);
    expect(loan1.validatePayment()).toBe(86_32n);
    expectPaymentTooLow(() => loan1.numPaymentsToZero(-160_00n), loan1.minPayment, -160_00n);

    expect(loan1.principalRemaining(33)).toBe(5914_80n); // $5,914.80
    expect(loan1.principalRemaining(0)).toBe(7500_00n);
    expect(loan1.principalRemaining(8, 300_00n)).toBe(5398_67n); // $5,398.67
    expect(loan1.principalRemaining(40, 500_00n)).toBe(0n);
    expect(loan1.principalRemaining(3, 200_00n, 3000_00n)).toBe(2447_88n); // $2,447.88
    expect(() => {
      loan1.principalRemaining(21, 40_00n, 9000_00n);
    }).toThrow(`payment of 4000 cannot be less than ${loan1.minPayment}`);

    expect(loan1.interestPaid(0)).toBe(0n);
    expect(loan1.interestPaid(22)).toBe(875_39n); // $875.39
    expect(loan1.interestPaid(8, 300_00n)).toBe(298_67n); // $298.67
    expect(loan1.interestPaid(50, 300_00n)).toBe(610_35n); // $610.35
    expectPaymentTooLow(() => loan1.interestPaid(30, 10_00n, 20000_00n), loan1.minPayment, 10_00n);
  });

  it('creates a Loan with optional parameters and proper attributes', async () => {
    expect(mortgage.name).toBe('Mortgage');
    expect(mortgage.principal).toBe(150000_00n);
    expect(mortgage.annualRate).toBe(62200n);
    expect(mortgage.periodicRate).toBeCloseTo(0.005183, 5);
    expect(mortgage.periods).toBe(180);
    expect(mortgage.minPayment).toBe(1292_25n); // $1,292.25
    expect(mortgage.currentBalance).toBe(75000_00n);
    expect(mortgage.fees).toBe(1000_00n);
  });

  it('creates a Loan with optional parameters and working methods', async () => {
    expect(mortgage.numPaymentsToZero()).toBe(70);
    expect(mortgage.numPaymentsToZero(1500_00n)).toBe(59);
    expectPaymentTooLow(() => mortgage.numPaymentsToZero(300_00n), mortgage.minPayment, 300_00n);

    expect(mortgage.validatePayment(1300_00n)).toBe(1300_00n);
    expect(mortgage.validatePayment()).toBe(1292_25n);
    expectPaymentTooLow(() => mortgage.validatePayment(20_00n), mortgage.minPayment, 20_00n);
    expectPaymentTooLow(() => mortgage.validatePayment(-160_00n), mortgage.minPayment, -160_00n);

    expect(mortgage.principalRemaining(33)).toBe(42574_06n); // $42,574.06
    expect(mortgage.principalRemaining(0)).toBe(75000_00n);
    expect(mortgage.principalRemaining(8, 1300_00n)).toBe(67576_38n); // $67,576.38
    expect(mortgage.principalRemaining(60, 1500_00n)).toBe(0n);
    expect(mortgage.principalRemaining(3, 1300_00n, 4000_00n)).toBe(142_27n); // $142.27
    expectPaymentTooLow(() => mortgage.principalRemaining(21, 40_00n, 9000_00n), mortgage.minPayment, 40_00n);
    expect(mortgage.interestPaid(0)).toBe(0n);
    expect(mortgage.interestPaid(22)).toBe(7432_38n); // $7,432.38
    expect(mortgage.interestPaid(8, 1300_00n)).toBe(2976_38n); // $2,976.38
    expect(mortgage.interestPaid(50, 1300_00n)).toBe(13140_94n); // $13,140.94
    expect(mortgage.interestPaid(59)).toBe(14073_60n); // $14,073.60
    expectPaymentTooLow(() => mortgage.interestPaid(30, 10_00n, 20000_00n), mortgage.minPayment, 10_00n);
  });

  it('calculates min payment for zero-interest loan correctly', async () => {
    expect(zeroRateLoan.minPayment).toBe(381_25n); // $381.25
  });
});
