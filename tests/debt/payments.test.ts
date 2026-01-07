import { describe, expect, it } from 'vitest';

import * as constants from '@/lib/constants.ts';
import { Loan } from '@/lib/debt/loan.ts';
import * as payments from '@/lib/debt/payments.ts';
import { PaymentRecord } from '@/lib/debt/paymentTypes.ts';
import * as sorting from '@/lib/shared/sorting.ts';

const Loans = (): Loan[] => [
  new Loan(314159.26, 0.0535, 12, 15, 'pi-house'),
  new Loan(27182.81, 0.0828, 12, 4, 'e-car', 23456.78),
  new Loan(10000, 0.0628 , 12, 3, 'tau', null, 300),
];

describe('payments module', () => {
  const [homeLoan, carLoan, otherLoan] = Loans();

  const loansAV = sorting.sortWith([otherLoan, homeLoan, carLoan], sorting.avalanche);
  const loansMinPayment = loansAV.reduce((currentValue: number, loan: Loan) => currentValue += loan.minPayment, 0);

  it('amortizes a single loan', async () => {
    const homeLoanAmortizationSchedule = payments.amortizePayments(
      homeLoan,
      homeLoan.principal,
      null,
      null
    );

    expect(homeLoanAmortizationSchedule.length).toBe(181);
    expect(homeLoanAmortizationSchedule[3].period).toBe(4);
    expect(homeLoanAmortizationSchedule[3].principal).toBeCloseTo(1156.712773, 5);
    expect(homeLoanAmortizationSchedule[3].interest).toBeCloseTo(1385.292599, 5);
    expect(homeLoanAmortizationSchedule[3].principalRemaining).toBeCloseTo(
      309563.122582, 5
    );
    expect(homeLoanAmortizationSchedule[119].period).toBe(120);
    expect(homeLoanAmortizationSchedule[119].principal).toBeCloseTo(1937.889312, 5);
    expect(homeLoanAmortizationSchedule[119].interest).toBeCloseTo(604.116060, 5);
    expect(homeLoanAmortizationSchedule[119].principalRemaining).toBeCloseTo(133564.778411, 5);
    expect(homeLoanAmortizationSchedule[179].period).toBe(180);
    expect(homeLoanAmortizationSchedule[179].principal).toBeCloseTo(2530.722568, 5);
    expect(homeLoanAmortizationSchedule[179].interest).toBeCloseTo(11.282804, 5);
    expect(homeLoanAmortizationSchedule[179].principalRemaining).toBe(0);
  });

  it('determines extra payment for multiple loans', async () => {
    expect(payments.determineExtraPayment(loansAV, 3700)).toBeCloseTo(185.314618, 5);
  });

  it('throws a paymentTooLowError when the total payment for loans is below their shared minimum', async () => {
    expect(() => {
      payments.determineExtraPayment(loansAV, 28);
    }).toThrow(`Payment amount of 28 must be greater than ${loansMinPayment}`);
  });

  it('determines carryover', async () => {
    expect(payments.determineCarryover(
        carLoan,
        1867.19,
        348.33,
        false
      )).toBeCloseTo(1518.860000, 5);
    expect(payments.determineCarryover(
        carLoan,
        1867.19,
        348.33,
        true
      )).toBeCloseTo(851.669664, 5);
  });

  it('amortizes payments for mutliple loans', async () => {
    const loansPaymentSummary = payments.payLoans(loansAV, 4000);

    for (const loanAV of loansAV) {
      expect(loansPaymentSummary[loanAV.id].lifetimeInterest.toFixed(5)).toBe(
        loansPaymentSummary[loanAV.id].amortizationSchedule
          .reduce((acc: number, cv: PaymentRecord) => acc + cv.interest, 0)
          .toFixed(5)
      );
    }

    // 2 keys more than the 3 loans for totalInterest and totalPayments
    expect(Object.keys(loansPaymentSummary).length).toBe(4);
    expect(loansPaymentSummary[carLoan.id].lifetimeInterest).toBeCloseTo(1906.719625, 5);
    expect(loansPaymentSummary[homeLoan.id].lifetimeInterest).toBeCloseTo(91584.952030, 5);
    expect(loansPaymentSummary[otherLoan.id].lifetimeInterest).toBeCloseTo(876.423974, 5);

    expect(loansPaymentSummary[constants.TOTALS].lifetimeInterest).toBeCloseTo(
      94368.095630, 5
    );
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule.length).toBe(111);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[110].principal).toBeCloseTo(1975.328955, 5);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[110].interest).toBeCloseTo(8.806674, 5);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[110].principalRemaining).toBe(0);
  });

  it('reduces minimum payments correctly and amortizes payments for multiple loans', async () => {
    const loansPaymentSummary = payments.payLoans(loansAV, 4000, true);

    for (const loanAV of loansAV) {
      expect(loansPaymentSummary[loanAV.id].lifetimeInterest.toFixed(5)).toBe(
        loansPaymentSummary[loanAV.id].amortizationSchedule
          .reduce((acc: number, cv: PaymentRecord) => acc + cv.interest, 0)
          .toFixed(5)
      );
    }

    expect(Object.keys(loansPaymentSummary).length).toBe(4);
    expect(loansPaymentSummary[carLoan.id].lifetimeInterest).toBeCloseTo(1906.719625, 5);
    expect(loansPaymentSummary[homeLoan.id].lifetimeInterest).toBeCloseTo(118982.162556, 5);
    expect(loansPaymentSummary[otherLoan.id].lifetimeInterest).toBeCloseTo(
      902.921493, 5
    );
    expect(loansPaymentSummary[constants.TOTALS].lifetimeInterest).toBeCloseTo(121791.803675, 5);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule.length).toBe(148);

    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[110].principal).toBeCloseTo(
      2562.376664, 5
    );
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[110].interest).toBeCloseTo(
      464.943326, 5
    );
    expect(
      loansPaymentSummary[constants.TOTALS].amortizationSchedule[110].principalRemaining
    ).toBeCloseTo(101723.977006, 5);

    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[147].principal).toBeCloseTo(
      1458.892110, 5
    );
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[147].interest).toBeCloseTo(
      6.504227, 5
    );
    expect(
      loansPaymentSummary[constants.TOTALS].amortizationSchedule[147].principalRemaining
    ).toBe(0);
  });
});
