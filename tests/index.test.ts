import { describe, expect, it } from 'vitest';

import * as moneyfunx from '@/index';

/**
 * Ensures all intended public members are exported from the library.
 * This test acts as a safeguard against accidental omission of core functionality
 * during refactors or version bumps.
 */
describe('moneyfunx module', () => {
  it('exports expected members matching the new descriptive naming standard', async () => {
    const expectedExports: string[] = [
      // Constants
      'MAX_DURATION_YEARS',
      'TOTALS',

      // Debt / Loans
      'ILoan',
      'Loan',
      'determineExtraPayment',
      'amortizePayments',
      'payLoans',
      'LoansPaymentSchedule',
      'LoanPrincipals',
      'PaymentSchedule',
      'PaymentRecord',

      // Investment / Accumulation
      'IInstrument',
      'Instrument',
      'amortizeContributions',
      'contributeInstruments',
      'determineExtraContribution',
      'ContributionRecord',
      'ContributionSchedule',
      'InstrumentsContributionSchedule',

      // Drawdown / Distribution
      'calculateAmortizedWithdrawal',
      'drawdownInstruments',
      'WithdrawalRecord',
      'WithdrawalSchedule',
      'InstrumentsWithdrawalSchedule',
      'performWaterfallDrawdown',

      // Shared Math Primitives
      'calculatePeriodicAmount',
      'calculateBalanceRemaining',
      'calculatePeriodsToZero',
      'calculateInterestOverPeriods',

      // Errors
      'NegativeContributionError',
      'PaymentTooLowError',
      'NegativeWithdrawalError',

      // Shared Utilities
      'HasRateAndBalance',
      'snowball',
      'avalanche',
      'sortWith',
    ].sort();

    expect(Object.keys(moneyfunx).sort()).toStrictEqual(expectedExports);
  });
});
