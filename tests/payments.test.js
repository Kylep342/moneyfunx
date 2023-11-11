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
    loan2.minPayment,
    120,
    0
  );

  expect(loan2AmortizationSchedule.length).toBe(120);
  expect(loan2AmortizationSchedule[3].period).toBe(4);
  expect(loan2AmortizationSchedule[3].principal).toBe(36.936086097409046);
  expect(loan2AmortizationSchedule[3].interest).toBe(19.85317788483475);
  expect(loan2AmortizationSchedule[3].principalRemaining).toBe(
    5353.066959559084
  );
  expect(loan2AmortizationSchedule[119].period).toBe(120);
  expect(loan2AmortizationSchedule[119].principal).toBe(56.580857822595135);
  expect(loan2AmortizationSchedule[119].interest).toBe(0.20840615964655876);
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
  expect(loanPaymentTotals1[loan1.id].lifetimeInterest).toBe(
    413.93373863001875
  );
  expect(loanPaymentTotals1[loan2.id].lifetimeInterest).toBe(609.5494995896901);
  expect(loanPaymentTotals1[loan3.id].lifetimeInterest).toBe(971.0068527042365);
  expect(loanPaymentTotals1["totals"].lifetimeInterest).toBe(
    1994.4900909239454
  );
  expect(loanPaymentTotals1["totals"].amortizationSchedule.length).toBe(55);

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
  expect(loanPaymentTotals2[loan1.id].lifetimeInterest).toBe(
    413.93373863001875
  );
  expect(loanPaymentTotals2[loan2.id].lifetimeInterest).toBe(644.4298504576783);
  expect(loanPaymentTotals2[loan3.id].lifetimeInterest).toBe(
    1077.7081908268365
  );
  expect(loanPaymentTotals2["totals"].lifetimeInterest).toBe(
    2136.0717799145336
  );
  expect(loanPaymentTotals2["totals"].amortizationSchedule.length).toBe(65);
  expect(loanPaymentTotals2["totals"].amortizationSchedule[5].principal).toBe(
    332.42927674420037
  );
  expect(loanPaymentTotals2["totals"].amortizationSchedule[5].interest).toBe(
    67.57072325579966
  );
  expect(
    loanPaymentTotals2["totals"].amortizationSchedule[5].principalRemaining
  ).toBe(17526.761885971344);
  expect(loanPaymentTotals2["totals"].amortizationSchedule[63].principal).toBe(
    271.47982431644215
  );
  expect(loanPaymentTotals2["totals"].amortizationSchedule[63].interest).toBe(
    0.8986081235097405
  );
  expect(
    loanPaymentTotals2["totals"].amortizationSchedule[63].principalRemaining
  ).toBe(7.8802140803709335);
});
