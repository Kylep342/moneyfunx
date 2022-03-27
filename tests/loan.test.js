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
    }
);
