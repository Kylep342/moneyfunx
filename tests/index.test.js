import { describe, expect, it } from 'vitest';

import * as moneyfunx from '@/index.ts'

describe('moneyfunx module', () => {
  it('exports expected members', async () => {
    expect(Object.keys(moneyfunx).sort()).toStrictEqual([
      "AmortizationRecord",
      "amortizePayments",
      "avalanche",
      "ContributionAmortizationRecord",
      "ContributionSchedule",
      "calculateMinPayment",
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
      "PaymentSchedule",
      "PaymentTooLowError",
      "principalRemaining",
      "snowball",
      "sortLoans",
      "TOTALS",
    ].sort());
  });
});
