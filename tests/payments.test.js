import { expect, test } from "@jest/globals";
import * as loan from "../src/lib/loan.js";
import * as sorting from "../src/lib/sorting.js";
import * as payments from "../src/lib/payments.js";


test(
    "Payments are good",
    () => {
        const loan1 = new loan.Loan(7500, .068, 12, 10);
        const loan2 = new loan.Loan(7500, .0368, 12, 10);
        const loan3 = new loan.Loan(4500, .0429, 12, 10);

        const loans = sorting.sortLoans(
            [loan2, loan3, loan1],
            sorting.snowball
        );

        const loan2AmortizationSchedule = payments.amortizePayments(loan2, loan2.minPayment, 120, 0);

        expect(loan2AmortizationSchedule.length).toBe(120);
        expect(loan2AmortizationSchedule[3].period).toBe(4);
        expect(loan2AmortizationSchedule[3].principal).toBe(52.27646756701894);
        expect(loan2AmortizationSchedule[3].interest).toBe(22.5219912775614);
        expect(loan2AmortizationSchedule[3].principalRemaining).toBe(7291.851122942134);

        expect(payments.determineExtraPayment(loans, 400)).toBe(192.70819668183697);
        expect(() => {payments.determineExtraPayment(loans, 0);}).toThrow("Payment amount of 0 must be greater than 207.29180331816303");

        const loanPaymentTotals1 = payments.payLoans(loans, 400);

        expect(Object.keys(loanPaymentTotals1).length).toBe(3);
        expect(loanPaymentTotals1[loan1.id].lifetimeInterest).toBe(659.9318259100721);
        expect(loanPaymentTotals1[loan2.id].lifetimeInterest).toBe(841.5352714723776);
        expect(loanPaymentTotals1[loan3.id].lifetimeInterest).toBe(462.70985781957734);
    }
);
