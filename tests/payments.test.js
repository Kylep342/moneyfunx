import { expect, test } from "@jest/globals";
// import * as errors from "../src/lib/errors.js";
import * as loan from "../src/lib/loan.ts";
import * as payments from "../src/lib/payments.ts";
import * as sorting from "../src/lib/sorting.ts";


test(
    "Payments are good",
    () => {
        const loan1 = new loan.Loan(7500, .068, 12, 10);
        const loan2 = new loan.Loan(7500, .0368, 12, 10);
        const loan3 = new loan.Loan(4500, .0429, 12, 10);

        const loans = sorting.sortLoans(
            [loan2, loan3, loan1],
            sorting.avalanche
        );

        const loan2AmortizationSchedule = payments.amortizePayments(loan2, loan2.minPayment, 120, 0);

        expect(loan2AmortizationSchedule.length).toBe(120);
        expect(loan2AmortizationSchedule[3].period).toBe(4);
        expect(loan2AmortizationSchedule[3].principal).toBe(52.27646756701894);
        expect(loan2AmortizationSchedule[3].interest).toBe(22.5219912775614);
        expect(loan2AmortizationSchedule[3].principalRemaining).toBe(7291.851122942134);
        expect(loan2AmortizationSchedule[119].period).toBe(120);
        expect(loan2AmortizationSchedule[119].principal).toBe(74.56977819145985);
        expect(loan2AmortizationSchedule[119].interest).toBe(0.2286806531204956);
        expect(loan2AmortizationSchedule[119].principalRemaining).toBe(0);

        expect(payments.determineExtraPayment(loans, 400)).toBe(192.70819668183697);
        expect(() => { payments.determineExtraPayment(loans, 0); }).toThrow("Payment amount of 0 must be greater than 207.29180331816303");

        const loanPaymentTotals1 = payments.payLoans(loans, 400);

        // 2 keys more than the 3 loans for totalInterest and totalPayments
        expect(Object.keys(loanPaymentTotals1).length).toBe(4);
        expect(loanPaymentTotals1[loan1.id].lifetimeInterest).toBe(659.9318259100721);
        expect(loanPaymentTotals1[loan2.id].lifetimeInterest).toBe(841.5352714723776);
        expect(loanPaymentTotals1[loan3.id].lifetimeInterest).toBe(462.70985781957734);
        expect(loanPaymentTotals1["totals"].lifetimeInterest).toBe(1964.176955202027);
        expect(loanPaymentTotals1["totals"].amortizationSchedule.length).toBe(56);

        // check construction of totals and reduction of minimum payments
        const loanPaymentTotals2 = payments.payLoans(loans, 400, true);

        expect(Object.keys(loanPaymentTotals2).length).toBe(4);
        expect(loanPaymentTotals2[loan1.id].lifetimeInterest).toBe(659.9318259100721);
        expect(loanPaymentTotals2[loan2.id].lifetimeInterest).toBe(1023.3555618526304);
        expect(loanPaymentTotals2[loan3.id].lifetimeInterest).toBe(468.8623078924966);
        expect(loanPaymentTotals2["totals"].lifetimeInterest).toBe(2152.149695655199);
        expect(loanPaymentTotals2["totals"].amortizationSchedule.length).toBe(66);
        expect(loanPaymentTotals2["totals"].amortizationSchedule[5].principal).toBe(326.5311845485409);
        expect(loanPaymentTotals2["totals"].amortizationSchedule[5].interest).toBe(73.46881545145911);
        expect(loanPaymentTotals2["totals"].amortizationSchedule[5].principalRemaining).toBe(17565.254303699232);
        expect(loanPaymentTotals2["totals"].amortizationSchedule[63].principal).toBe(265.8244635342227);
        expect(loanPaymentTotals2["totals"].amortizationSchedule[63].interest).toBe(1.6821919921946735);
        expect(loanPaymentTotals2["totals"].amortizationSchedule[63].principalRemaining).toBe(282.71640348577967);
    }
);
