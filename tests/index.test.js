import { describe, expect, it } from 'vitest';

import * as moneyfunx from '../src/index.ts'

describe('moneyfunx module', () => {
  it('exports expected members', async () => {
    expect(Object.keys(moneyfunx).sort()).toStrictEqual([
      "AmortizationRecord",
      "amortizePayments",
      "avalanche",
      "calculateMinPayment",
      "determineExtraPayment",
      "interestPaid",
      "ILoan",
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
