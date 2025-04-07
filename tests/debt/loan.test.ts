import { describe, expect, it } from 'vitest';

import { Loan } from '@/lib/debt/loan.ts';

const Loans = () => [
  new Loan(7500, 0.068, 12, 10, 'Student Loan'),
  new Loan(150000, 0.0622, 12, 15, 'Mortgage', 75000, 1000),
  new Loan(18300, 0, 12, 4, 'Car'),
];

function expectPaymentTooLow(fn: () => void, min: number, val: number) {
  expect(fn).toThrow(`payment of ${val} cannot be less than ${min}`);
}

describe('loan module', () => {
  const [loan1, mortgage, zeroRateLoan] = Loans();

  it('creates a Loan with proper attributes', async () => {
    expect(loan1.name).toBe('Student Loan');
    expect(loan1.principal).toBe(7500);
    expect(loan1.annualRate).toBe(0.068);
    expect(loan1.periodicRate).toBeCloseTo(0.068/12);
    expect(loan1.periods).toBe(120);
    expect(loan1.minPayment).toBeCloseTo(86.310247, 5);
    expect(loan1.currentBalance).toBe(7500);
    expect(loan1.fees).toBe(0);
  });

  it('creates a Loan with working methods', async () => {
    expect(loan1.numPaymentsToZero()).toBe(120);
    expect(loan1.numPaymentsToZero(300)).toBe(28);
    expectPaymentTooLow(() => loan1.numPaymentsToZero(30), loan1.minPayment, 30);

    expect(loan1.validatePayment(100)).toBe(100);
    expect(loan1.validatePayment()).toBeCloseTo(86.310247, 5);
    expectPaymentTooLow(() => loan1.numPaymentsToZero(-160), loan1.minPayment, -160);

    expect(loan1.principalRemaining(33)).toBeCloseTo(5915.168870, 5);
    expect(loan1.principalRemaining(0)).toBe(7500);
    expect(loan1.principalRemaining(8, 300)).toBeCloseTo(5398.676996, 5);
    expect(loan1.principalRemaining(40, 500)).toBe(0);
    expect(loan1.principalRemaining(3, 200, 3000)).toBeCloseTo(2447.883123, 5);
    expect(() => {
      loan1.principalRemaining(21, 40, 9000);
    }).toThrow(`payment of 40 cannot be less than ${loan1.minPayment}`);

    expect(loan1.interestPaid(0)).toBe(0);
    expect(loan1.interestPaid(22)).toBeCloseTo(875.426397, 5);
    expect(loan1.interestPaid(8, 300)).toBeCloseTo(298.676996, 5);
    expect(loan1.interestPaid(50, 300)).toBeCloseTo(610.360992, 5);
    expectPaymentTooLow(() => loan1.interestPaid(30, 10, 20000), loan1.minPayment, 10);
  });
  it('creates a Loan with optional parameters and proper attributes', async () => {
    expect(mortgage.name).toBe('Mortgage');
    expect(mortgage.principal).toBe(150000);
    expect(mortgage.annualRate).toBe(0.0622);
    expect(mortgage.periodicRate).toBeCloseTo(0.005183, 5);
    expect(mortgage.periods).toBe(180);
    expect(mortgage.minPayment).toBeCloseTo(1283.683005, 5);
    expect(mortgage.currentBalance).toBe(75000);
    expect(mortgage.fees).toBe(1000);
  });

  it('creates a Loan with optional parameters and working methods', async () => {
    expect(mortgage.numPaymentsToZero()).toBe(70);
    expect(mortgage.numPaymentsToZero(1500)).toBe(59);
    expectPaymentTooLow(() => mortgage.numPaymentsToZero(300), mortgage.minPayment, 300);

    expect(mortgage.validatePayment(1300)).toBe(1300);
    expect(mortgage.validatePayment()).toBeCloseTo(1283.683005, 5);
    expectPaymentTooLow(() => mortgage.validatePayment(20), mortgage.minPayment, 20);
    expectPaymentTooLow(() => mortgage.validatePayment(-160), mortgage.minPayment, -160);

    expect(mortgage.principalRemaining(33)).toBeCloseTo(42881.516563, 5);
    expect(mortgage.principalRemaining(0)).toBe(75000);
    expect(mortgage.principalRemaining(8, 1300)).toBeCloseTo(67576.367309, 5);
    expect(mortgage.principalRemaining(60, 1500)).toBe(0);
    expect(mortgage.principalRemaining(3, 1300, 4000)).toBeCloseTo(142.273033, 5);
    expectPaymentTooLow(() => mortgage.principalRemaining(21, 40, 9000), mortgage.minPayment, 40);
    expect(mortgage.interestPaid(0)).toBe(0);
    expect(mortgage.interestPaid(22)).toBeCloseTo(7442.995104, 5);
    expect(mortgage.interestPaid(8, 1300)).toBeCloseTo(2976.367309, 5);
    expect(mortgage.interestPaid(50, 1300)).toBeCloseTo(13140.910180, 5);
    expect(mortgage.interestPaid(59)).toBeCloseTo(14157.609595, 5);
    expectPaymentTooLow(() => mortgage.interestPaid(30, 10, 20000), mortgage.minPayment, 10);
  });

  it('calculates min payment for zero-interest loan correctly', async () => {
    expect(zeroRateLoan.minPayment).toBe(381.25);
  })
});
