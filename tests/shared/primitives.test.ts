import { describe, expect, it } from 'vitest';
import * as sharedFinancialPrimitives from '@/lib/shared/primitives';

/**
 * Unit tests for shared financial primitives.
 * These tests ensure the core mathematical engine for the library is accurate
 * across various interest rates and durations.
 */
describe('shared financial primitives', () => {
  // Shared test constants for consistency across test cases
  const initialPrincipalBalance: number = 10000;
  const annualInterestRate: number = 0.05;
  const periodicInterestRate: number = annualInterestRate / 12;
  const totalLoanPeriods: number = 120; // 10 years in months

  describe('calculatePeriodicAmount (PMT)', () => {
    it('should calculate the standard amortization payment correctly', () => {
      const calculatedPeriodicAmount: number = sharedFinancialPrimitives.calculatePeriodicAmount(
        initialPrincipalBalance,
        periodicInterestRate,
        totalLoanPeriods
      );

      // Expected: $10,000 at 5% for 120 periods is ~$106.0655
      expect(calculatedPeriodicAmount).toBeCloseTo(106.0655, 4);
    });

    it('should handle zero percent interest rates via simple division', () => {
      const simplePrincipalBalance: number = 12000;
      const zeroInterestRate: number = 0;
      const twelveMonths: number = 12;

      const calculatedPeriodicAmount: number = sharedFinancialPrimitives.calculatePeriodicAmount(
        simplePrincipalBalance,
        zeroInterestRate,
        twelveMonths
      );

      expect(calculatedPeriodicAmount).toBe(1000);
    });
  });

  describe('calculateBalanceRemaining (FV)', () => {
    it('should calculate the correct remaining balance after a specific number of periods', () => {
      const fixedPeriodicPayment: number = 150;
      const periodsElapsed: number = 12;

      const remainingBalance: number = sharedFinancialPrimitives.calculateBalanceRemaining(
        initialPrincipalBalance,
        fixedPeriodicPayment,
        periodicInterestRate,
        periodsElapsed
      );

      // Corrected math expectation for 1 year of $150 payments at 5%
      expect(remainingBalance).toBeCloseTo(8669.7907, 4);
    });

    it('should return zero if the balance is overpaid within the specified periods', () => {
      const smallInitialBalance: number = 1000;
      const largePeriodicPayment: number = 1200;
      const singlePeriod: number = 1;

      const remainingBalance: number = sharedFinancialPrimitives.calculateBalanceRemaining(
        smallInitialBalance,
        largePeriodicPayment,
        periodicInterestRate,
        singlePeriod
      );

      expect(remainingBalance).toBe(0);
    });

    it('should calculate the correct remaining balance for zero percent interest scenarios', () => {
      const zeroInterestRate: number = 0;
      const fixedPeriodicPayment: number = 100;
      const fivePeriodsElapsed: number = 5;

      const remainingBalance: number = sharedFinancialPrimitives.calculateBalanceRemaining(
        1000,
        fixedPeriodicPayment,
        zeroInterestRate,
        fivePeriodsElapsed
      );

      expect(remainingBalance).toBe(500);
    });
  });

  describe('calculatePeriodsToZero (NPER)', () => {
    it('should calculate the total number of periods required to reach a zero balance', () => {
      const fixedPeriodicPayment: number = 200;

      const totalPeriodsRequired: number = sharedFinancialPrimitives.calculatePeriodsToZero(
        initialPrincipalBalance,
        fixedPeriodicPayment,
        periodicInterestRate
      );

      // $10,000 at 5% with $200 payments rounds up to 57 months
      expect(totalPeriodsRequired).toBe(57);
    });
  });

  describe('calculateInterestOverPeriods', () => {
    it('should calculate the total interest paid during a set duration', () => {
      // Using a slightly more precise payment to match amortization curve
      const fixedPeriodicPayment: number = 106.07;
      const oneYearInMonths: number = 12;

      const totalInterestPaid: number = sharedFinancialPrimitives.calculateInterestOverPeriods(
        initialPrincipalBalance,
        fixedPeriodicPayment,
        periodicInterestRate,
        oneYearInMonths
      );

      // Total interest for the first year should be approximately $482.04
      expect(totalInterestPaid).toBeCloseTo(482.04, 2);
    });

    it('should return zero interest for loans with a zero percent interest rate', () => {
      const zeroInterestRate: number = 0;
      const fixedPeriodicPayment: number = 100;
      const fivePeriods: number = 5;

      const totalInterestPaid: number = sharedFinancialPrimitives.calculateInterestOverPeriods(
        1000,
        fixedPeriodicPayment,
        zeroInterestRate,
        fivePeriods
      );

      expect(totalInterestPaid).toBe(0);
    });
  });
});
