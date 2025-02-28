import { describe, expect, it } from 'vitest';

import { Loan } from '@/lib/loan.ts';

const Loans = () => [
  new Loan(7500, 0.068, 12, 10, 'Student Loan'),
  new Loan(150000, 0.0622, 12, 15, 'Mortgage', 75000, 1000),
  new Loan(18300, 0, 12, 4, 'Car'),
];

describe('loan module', () => {
  const [loan1, mortgage, zeroRateLoan] = Loans();

  it('creates a Loan with proper attributes', async () => {
    expect(loan1.name).toBe('Student Loan');
    expect(loan1.principal).toBe(7500);
    expect(loan1.annualRate).toBe(0.068);
    expect(loan1.periodicRate).toBe(0.005666666666666667);
    expect(loan1.periods).toBe(120);
    expect(loan1.minPayment).toBe(86.31024763658397);
    expect(loan1.currentBalance).toBe(7500);
    expect(loan1.fees).toBe(0);
  });

  it('creates a Loan with working methods', async () => {
    expect(loan1.numPaymentsToZero()).toBe(120);
    expect(loan1.numPaymentsToZero(300)).toBe(28);
    expect(() => {
      loan1.numPaymentsToZero(30);
    }).toThrow(`payment of 30 cannot be less than ${loan1.minPayment}`);

    expect(loan1.validatePayment(100)).toBe(100);
    expect(loan1.validatePayment()).toBe(86.31024763658397);
    expect(() => {
      loan1.validatePayment(20);
    }).toThrow('payment of 20 cannot be less than 86.31024763658397');
    expect(() => {
      loan1.validatePayment(-160);
    }).toThrow(`payment of -160 cannot be less than ${loan1.minPayment}`);

    expect(loan1.principalRemaining(33)).toBe(5915.168870573016);
    expect(loan1.principalRemaining(0)).toBe(7500);
    expect(loan1.principalRemaining(8, 300)).toBe(5398.67699631769);
    expect(loan1.principalRemaining(40, 500)).toBe(0);
    expect(loan1.principalRemaining(3, 200, 3000)).toBe(2447.8831236666597);
    expect(() => {
      loan1.principalRemaining(21, 40, 9000);
    }).toThrow(`payment of 40 cannot be less than ${loan1.minPayment}`);

    expect(loan1.interestPaid(0)).toBe(0);
    expect(loan1.interestPaid(22)).toBe(875.4263974363766);
    expect(loan1.interestPaid(8, 300)).toBe(298.6769963176903);
    expect(loan1.interestPaid(50, 300)).toBe(610.3609925683494);
    expect(() => {
      loan1.interestPaid(30, 10, 20000);
    }).toThrow(`payment of 10 cannot be less than ${loan1.minPayment}`);
  });
  it('creates a Loan with optional parameters and proper attributes', async () => {
    expect(mortgage.name).toBe('Mortgage');
    expect(mortgage.principal).toBe(150000);
    expect(mortgage.annualRate).toBe(0.0622);
    expect(mortgage.periodicRate).toBe(0.005183333333333333);
    expect(mortgage.periods).toBe(180);
    expect(mortgage.minPayment).toBe(1283.6830056654117);
    expect(mortgage.currentBalance).toBe(75000);
    expect(mortgage.fees).toBe(1000);
  });

  it('creates a Loan with optional parameters and working methods', async () => {
    expect(mortgage.numPaymentsToZero()).toBe(70);
    expect(mortgage.numPaymentsToZero(1500)).toBe(59);
    expect(() => {
      mortgage.numPaymentsToZero(300);
    }).toThrow(`payment of 300 cannot be less than ${mortgage.minPayment}`);

    expect(mortgage.validatePayment(1300)).toBe(1300);
    expect(mortgage.validatePayment()).toBe(1283.6830056654117);
    expect(() => {
      mortgage.validatePayment(20);
    }).toThrow(`payment of 20 cannot be less than ${mortgage.minPayment}`);
    expect(() => {
      mortgage.validatePayment(-160);
    }).toThrow(`payment of -160 cannot be less than ${mortgage.minPayment}`);

    expect(mortgage.principalRemaining(33)).toBe(42881.51656374325);
    expect(mortgage.principalRemaining(0)).toBe(75000);
    expect(mortgage.principalRemaining(8, 1300)).toBe(67576.36730982608);
    expect(mortgage.principalRemaining(60, 1500)).toBe(0);
    expect(mortgage.principalRemaining(3, 1300, 4000)).toBe(142.2730333468935);
    expect(() => {
      mortgage.principalRemaining(21, 40, 9000);
    }).toThrow(`payment of 40 cannot be less than ${mortgage.minPayment}`);

    expect(mortgage.interestPaid(0)).toBe(0);
    expect(mortgage.interestPaid(22)).toBe(7442.995104981193);
    expect(mortgage.interestPaid(8, 1300)).toBe(2976.367309826077);
    expect(mortgage.interestPaid(50, 1300)).toBe(13140.910180952385);
    expect(mortgage.interestPaid(59)).toBe(14157.60959553707);
    expect(() => {
      mortgage.interestPaid(30, 10, 20000);
    }).toThrow(`payment of 10 cannot be less than ${mortgage.minPayment}`);
  });

  it('calculates min payment for zero-interest loan correctly', async () => {
    expect(zeroRateLoan.minPayment).toBe(381.25);
  })
});
