import { test, expect } from "@jest/globals";
import * as loan from "../src/lib/loan.js"

test(
    "Loan with principal=7500, interest=0.068, periods/year=12, years=10 has proper attributes",
    () => {
        const loan1 = new loan.Loan(7500, 0.068, 12, 10);

        expect(loan1.periodicRate).toBe(0.005666666666666667);
        expect(loan1.periods).toBe(120);
        expect(loan1.minPayment).toBe(86.31024763658397);
        expect(loan1.totalInterest).toBe(2857.2297163900766);

        expect(loan1.numPaymentsToZero()).toBe(120);
        expect(loan1.numPaymentsToZero(300)).toBe(28);
        expect(() => {loan1.numPaymentsToZero(30)}).toThrow("payment of 30 cannot be less than 86.31024763658397");

        expect(loan1.validatePayment(100)).toBe(100);
        expect(loan1.validatePayment()).toBe(86.31024763658397);
        expect(() => {loan1.validatePayment(20)}).toThrow("payment of 20 cannot be less than 86.31024763658397");
        expect(() => {loan1.validatePayment(-160)}).toThrow("payment of -160 cannot be less than 86.31024763658397");

        expect(loan1.principalRemaining(33)).toBe(5915.168870573016);
        expect(loan1.principalRemaining(0)).toBe(7500);
        expect(loan1.principalRemaining(40, 500)).toBe(0);
        expect(loan1.principalRemaining(3, 200, 3000)).toBe(2447.8831236666597);
        expect(() => {loan1.principalRemaining(21, 40, 9000)}).toThrow("payment of 40 cannot be less than 86.31024763658397");

        expect(loan1.interestPaid(0)).toBe(0);
        expect(loan1.interestPaid(22)).toBe(875.4263974363766);
        expect(loan1.interestPaid(50, 300)).toBe(610.3609925683494);
        expect(loan1.interestPaid(120)).toBe(loan1.totalInterest);
        expect(() => {loan1.interestPaid(30, 10, 20000)}).toThrow("payment of 10 cannot be less than 86.31024763658397");
    }
);
