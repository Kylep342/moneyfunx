import { expect, test } from "@jest/globals";
// import * as errors from "../src/lib/errors.js";
import * as loan from "../src/lib/loan.ts";
import * as payments from "../src/lib/payments.ts";
import * as sorting from "../src/lib/sorting.ts";

test("Payments are good", () => {
  const loan1 = new loan.Loan(6500, 0.0559, 12, 10);
  const loan2 = new loan.Loan(5500, 0.0442, 12, 10);
  const loan3 = new loan.Loan(7500, 0.0386, 12, 10);

  const loansAV = sorting.sortLoans([loan2, loan3, loan1], sorting.avalanche);

  const loan2AmortizationSchedule = payments.amortizePayments(
    loan2,
    loan2.principal,
    loan2.minPayment,
    120,
    0
  );

  expect(loan2AmortizationSchedule.length).toBe(120);
  expect(loan2AmortizationSchedule[3].period).toBe(4);
  expect(loan2AmortizationSchedule[3].principal).toBe(36.936086097409046);
  expect(loan2AmortizationSchedule[3].interest).toBe(19.853177884834746);
  expect(loan2AmortizationSchedule[3].principalRemaining).toBe(
    5353.0669595590825
  );
  expect(loan2AmortizationSchedule[119].period).toBe(120);
  expect(loan2AmortizationSchedule[119].principal).toBe(56.58085782246671);
  expect(loan2AmortizationSchedule[119].interest).toBe(0.20840615964608575);
  expect(loan2AmortizationSchedule[119].principalRemaining).toBe(0);

  expect(payments.determineExtraPayment(loansAV, 400)).toBe(196.94260105405368);
  expect(() => {
    payments.determineExtraPayment(loansAV, 0);
  }).toThrow("Payment amount of 0 must be greater than 203.05739894594632");

  const loanPaymentTotals1 = payments.payLoans(loansAV, 400);

  for (const loanAV of loansAV) {
    expect(loanPaymentTotals1[loanAV.id].lifetimeInterest.toFixed(5)).toBe(
      loanPaymentTotals1[loanAV.id].amortizationSchedule
        .reduce((acc, cv) => acc + cv.interest, 0)
        .toFixed(5)
    );
  }

  // 2 keys more than the 3 loans for totalInterest and totalPayments
  expect(Object.keys(loanPaymentTotals1).length).toBe(4);
  expect(loanPaymentTotals1[loan1.id].lifetimeInterest).toBe(413.9337386301653);
  expect(loanPaymentTotals1[loan2.id].lifetimeInterest).toBe(601.7498710555524);
  expect(loanPaymentTotals1[loan3.id].lifetimeInterest).toBe(943.9331955148949);
  expect(loanPaymentTotals1["totals"].lifetimeInterest).toBe(
    1959.6168052006126
  );
  expect(loanPaymentTotals1["totals"].amortizationSchedule.length).toBe(54);

  // check construction of totals and reduction of minimum payments
  const loanPaymentTotals2 = payments.payLoans(loansAV, 400, true);

  for (const loanAV of loansAV) {
    expect(loanPaymentTotals2[loanAV.id].lifetimeInterest.toFixed(5)).toBe(
      loanPaymentTotals2[loanAV.id].amortizationSchedule
        .reduce((acc, cv) => acc + cv.interest, 0)
        .toFixed(5)
    );
  }

  expect(Object.keys(loanPaymentTotals2).length).toBe(4);
  expect(loanPaymentTotals2[loan1.id].lifetimeInterest).toBe(413.9337386301653);
  expect(loanPaymentTotals2[loan2.id].lifetimeInterest).toBe(635.7853045936348);
  expect(loanPaymentTotals2[loan3.id].lifetimeInterest).toBe(
    1051.0564225332632
  );
  expect(loanPaymentTotals2["totals"].lifetimeInterest).toBe(2100.775465757063);
  expect(loanPaymentTotals2["totals"].amortizationSchedule.length).toBe(64);
  expect(loanPaymentTotals2["totals"].amortizationSchedule[5].principal).toBe(
    332.6133004777731
  );
  expect(loanPaymentTotals2["totals"].amortizationSchedule[5].interest).toBe(
    67.38669952222693
  );
  expect(
    loanPaymentTotals2["totals"].amortizationSchedule[5].principalRemaining
  ).toBe(17476.61666760264);
  expect(loanPaymentTotals2["totals"].amortizationSchedule[63].principal).toBe(
    42.46552108667288
  );
  expect(loanPaymentTotals2["totals"].amortizationSchedule[63].interest).toBe(
    0.1365974261621311
  );
  expect(
    loanPaymentTotals2["totals"].amortizationSchedule[63].principalRemaining
  ).toBe(0);
});
