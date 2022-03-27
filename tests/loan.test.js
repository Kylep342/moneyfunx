import { test, expect } from '@jest/globals';
import * as loan from '../src/lib/loan.js'

test(
    'Loan with principal=7500, interest=0.068, periods/year=12, years=10 has proper attributes',
    () => {
        const goodLoan = new loan.Loan(7500, 0.068, 12, 10);

        expect(goodLoan.periodicRate).toBe(0.005666666666666667);
        expect(goodLoan.periods).toBe(120);
        expect(goodLoan.minPayment).toBe(86.31024763658397);
        expect(goodLoan.totalInterest).toBe(2857.2297163900766);

        expect(goodLoan.numPaymentsToZero()).toBe(120);
        expect(goodLoan.numPaymentsToZero(300)).toBe(28);
        expect(() => {goodLoan.numPaymentsToZero(30)}).toThrow('payment of 30 cannot be less than 86.31024763658397');

        expect(goodLoan.validatePayment(100)).toBe(100);
        expect(goodLoan.validatePayment()).toBe(86.31024763658397);
        expect(() => {goodLoan.validatePayment(20)}).toThrow('payment of 20 cannot be less than 86.31024763658397');
        expect(() => {goodLoan.validatePayment(-160)}).toThrow('payment of -160 cannot be less than 86.31024763658397');

        expect(goodLoan.principalRemaining(33)).toBe(5915.168870573016);
        expect(goodLoan.principalRemaining(0)).toBe(7500);
        expect(goodLoan.principalRemaining(40, 500)).toBe(0);
        expect(goodLoan.principalRemaining(3, 200, 3000)).toBe(2447.8831236666597);
        expect(() => {goodLoan.principalRemaining(21, 40, 9000)}).toThrow('payment of 40 cannot be less than 86.31024763658397')

        expect(goodLoan.interestPaid(0)).toBe(0);
    }
);
