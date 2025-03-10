import { describe, expect, it } from 'vitest';

import * as moneyfunx from '@/index.ts'

describe('moneyfunx module', () => {
  it('exports expected members', async () => {
    expect(Object.keys(moneyfunx).sort()).toStrictEqual([
      "amortizeContributions",
      "amortizePayments",
      "avalanche",
      "ContributionRecord",
      "ContributionSchedule",
      "calculateMinPayment",
      "contributeInstruments",
      "determineExtraContribution",
      "determineExtraPayment",
      "interestPaid",
      "IInstrument",
      "ILoan",
      "Instrument",
      "InstrumentBalances",
      "InstrumentsContributionSchedule",
      "Loan",
      "LoanPrincipals",
      "LoansPaymentSchedule",
      "MAX_DURATION_YEARS",
      "numPaymentsToZero",
      "NegativeContributionError",
      "payLoans",
      "PaymentRecord",
      "PaymentSchedule",
      "PaymentTooLowError",
      "principalRemaining",
      "snowball",
      "sortLoans",
      "TOTALS",
    ].sort());
  });
});
