import { describe, expect, it } from 'vitest';

import * as constants from '../../src/lib/constants';
import { Loan } from '../../src/lib/debt/loan';
import * as payments from '../../src/lib/debt/payments';
import { PaymentRecord } from '../../src/lib/debt/paymentTypes';
import * as sorting from '../../src/lib/shared/sorting';

const Loans = (): Loan[] => [
  new Loan(314159.26, 0.0535, 12, 15, 'pi-house'),
  new Loan(27182.81, 0.0828, 12, 4, 'e-car', 23456.78),
  new Loan(10000, 0.0628, 12, 3, 'tau', undefined, 300),
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

    expect(homeLoanAmortizationSchedule.length).toBe(180);
    expect(homeLoanAmortizationSchedule[3].period).toBe(4);
    expect(homeLoanAmortizationSchedule[3].principal).toBe(1156.72);
    expect(homeLoanAmortizationSchedule[3].interest).toBe(1385.29);
    expect(homeLoanAmortizationSchedule[3].principalRemaining).toBe(309563.11);
    expect(homeLoanAmortizationSchedule[119].period).toBe(120);
    expect(homeLoanAmortizationSchedule[119].principal).toBe(1937.9);
    expect(homeLoanAmortizationSchedule[119].interest).toBe(604.11);
    expect(homeLoanAmortizationSchedule[119].principalRemaining).toBe(133564.13);
    expect(homeLoanAmortizationSchedule[179].period).toBe(180);
    expect(homeLoanAmortizationSchedule[179].principal).toBe(2529.59);
    expect(homeLoanAmortizationSchedule[179].interest).toBe(11.28);
    expect(homeLoanAmortizationSchedule[179].principalRemaining).toBe(0);
  });

  it('determines extra payment for multiple loans', async () => {
    expect(payments.determineExtraPayment(loansAV, 3700)).toBe(185.31);
  });

  it('throws a paymentTooLowError when the total payment for loans is below their shared minimum', async () => {
    const tooLowPayment = 28;
    expect(() => {
      payments.determineExtraPayment(loansAV, tooLowPayment);
    }).toThrow(`Payment amount of ${tooLowPayment} must be greater than 3514.69`);
  });

  it('determines carryover', async () => {
    expect(payments.determineCarryover(
        carLoan,
        1867.19,
        348.33,
        false
      )).toBe(1518.86);
    expect(payments.determineCarryover(
        carLoan,
        1867.19,
        348.33,
        true
      )).toBe(851.67);
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
    expect(loansPaymentSummary[carLoan.id].lifetimeInterest).toBe(1906.74);
    expect(loansPaymentSummary[homeLoan.id].lifetimeInterest).toBe(91585.01);
    expect(loansPaymentSummary[otherLoan.id].lifetimeInterest).toBe(876.43);

    expect(loansPaymentSummary[constants.TOTALS].lifetimeInterest).toBe(94368.18);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule.length).toBe(111);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[110].principal).toBe(1975.39);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[110].interest).toBe(8.81);
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
    expect(loansPaymentSummary[carLoan.id].lifetimeInterest).toBe(1906.74);
    expect(loansPaymentSummary[homeLoan.id].lifetimeInterest).toBe(118982.19);
    expect(loansPaymentSummary[otherLoan.id].lifetimeInterest).toBe(902.93);

    expect(loansPaymentSummary[constants.TOTALS].lifetimeInterest).toBe(121791.86);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule.length).toBe(148);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[110].principal).toBe(2562.38);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[110].interest).toBe(464.94);
    expect(
      loansPaymentSummary[constants.TOTALS].amortizationSchedule[110].principalRemaining
    ).toBe(101724.03);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[147].principal).toBe(1458.93);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[147].interest).toBe(6.5);
    expect(
      loansPaymentSummary[constants.TOTALS].amortizationSchedule[147].principalRemaining
    ).toBe(0);
  });
});
