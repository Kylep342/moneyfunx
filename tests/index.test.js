import { describe, expect, it } from 'vitest';

import * as moneyfunx from '@/index.ts'

describe('moneyfunx module', () => {
  it('exports expected members', async () => {
    expect(Object.keys(moneyfunx).sort()).toStrictEqual([
      "AmortizationRecord",
      "amortizePayments",
      "avalanche",
      "calculateMinPayment",
      "determineExtraPayment",
      "interestPaid",
      "IInstrument",
      "ILoan",
      "Instrument",
      "Loan",
      "LoanPrincipals",
      "LoansPaymentSchedule",
      "numPaymentsToZero",
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
