import { describe, expect, it } from 'vitest';

import { moneyfunx } from '../src/index.ts'

describe('moneyfunx module', () => {
  it('exports expected members', async () => {
    expect(Object.keys(moneyfunx)).toStrictEqual([
      "amortizePayments",
      "avalanche",
      "calculateMinPayment",
      "determineExtraPayment",
      "interestPaid",
      "Loan",
      "numPaymentsToZero",
      "payLoans",
      "PaymentTooLowError",
      "principalRemaining",
      "snowball",
      "sortLoans",
      "TOTALS",
    ]);
  });
});