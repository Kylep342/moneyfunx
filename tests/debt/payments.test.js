import { describe, expect, it } from 'vitest';

import * as constants from '@/lib/constants.ts';
import { Loan } from '@/lib/loan.ts';
import * as payments from '@/lib/payments.ts';
import * as sorting from '@/lib/sorting.ts';

const Loans = () => [
  new Loan(314159.26, 0.0535, 12, 15, 'pi-house'),
  new Loan(27182.81, 0.0828, 12, 4, 'e-car', 23456.78),
  new Loan(10000, 0.0628 , 12, 3, 'tau', null, 300),
];

describe('payments module', () => {
  const [homeLoan, carLoan, otherLoan] = Loans();

  const loansAV = sorting.sortLoans([otherLoan, homeLoan, carLoan], sorting.avalanche);
  const loansMinPayment = loansAV.reduce((currentValue, loan) => currentValue += loan.minPayment, 0);

  it('amortizes a single loan', async () => {
    const homeLoanAmortizationSchedule = payments.amortizePayments(
      homeLoan,
      homeLoan.principal,
      null,
      null
    );

    expect(homeLoanAmortizationSchedule.length).toBe(181);
    expect(homeLoanAmortizationSchedule[3].period).toBe(4);
    expect(homeLoanAmortizationSchedule[3].principal).toBe(1156.712773965719);
    expect(homeLoanAmortizationSchedule[3].interest).toBe(1385.2925992958958);
    expect(homeLoanAmortizationSchedule[3].principalRemaining).toBe(
      309563.12258212303
    );
    expect(homeLoanAmortizationSchedule[119].period).toBe(120);
    expect(homeLoanAmortizationSchedule[119].principal).toBe(1937.8893129920505);
    expect(homeLoanAmortizationSchedule[119].interest).toBe(604.1160602695643);
    expect(homeLoanAmortizationSchedule[119].principalRemaining).toBe(133564.7784110224);
    expect(homeLoanAmortizationSchedule[179].period).toBe(180);
    expect(homeLoanAmortizationSchedule[179].principal).toBe(2530.7225684669434);
    expect(homeLoanAmortizationSchedule[179].interest).toBe(11.282804784415122);
    expect(homeLoanAmortizationSchedule[179].principalRemaining).toBe(0);
  });

  it('determines extra payment for multiple loans', async () => {
    expect(payments.determineExtraPayment(loansAV, 3700)).toBe(185.31461852038683);
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
      )).toBe(1518.8600000000001);
    expect(payments.determineCarryover(
        carLoan,
        1867.19,
        348.33,
        true
      )).toBe(851.6696647586657);
  });

  it('amortizes payments for mutliple loans', async () => {
    const loanPaymentTotals = payments.payLoans(loansAV, 4000);

    for (const loanAV of loansAV) {
      expect(loanPaymentTotals[loanAV.id].lifetimeInterest.toFixed(5)).toBe(
        loanPaymentTotals[loanAV.id].amortizationSchedule
          .reduce((acc, cv) => acc + cv.interest, 0)
          .toFixed(5)
      );
    }

    // 2 keys more than the 3 loans for totalInterest and totalPayments
    expect(Object.keys(loanPaymentTotals).length).toBe(4);
    expect(loanPaymentTotals[carLoan.id].lifetimeInterest).toBe(1906.7196253547775);
    expect(loanPaymentTotals[homeLoan.id].lifetimeInterest).toBe(91584.95203058577);
    expect(loanPaymentTotals[otherLoan.id].lifetimeInterest).toBe(876.4239742791409);

    expect(loanPaymentTotals[constants.TOTALS].lifetimeInterest).toBe(
      94368.09563021969
    );
    expect(loanPaymentTotals[constants.TOTALS].amortizationSchedule.length).toBe(111);
    expect(loanPaymentTotals[constants.TOTALS].amortizationSchedule[110].principal).toBe(1975.328955294327);
    expect(loanPaymentTotals[constants.TOTALS].amortizationSchedule[110].interest).toBe(8.806674925687208);
    expect(loanPaymentTotals[constants.TOTALS].amortizationSchedule[110].principalRemaining).toBe(0);
  });

  it('reduces minimum payments correctly and amortizes payments for multiple loans', async () => {
    const loanPaymentTotals = payments.payLoans(loansAV, 4000, true);

    for (const loanAV of loansAV) {
      expect(loanPaymentTotals[loanAV.id].lifetimeInterest.toFixed(5)).toBe(
        loanPaymentTotals[loanAV.id].amortizationSchedule
          .reduce((acc, cv) => acc + cv.interest, 0)
          .toFixed(5)
      );
    }

    expect(Object.keys(loanPaymentTotals).length).toBe(4);
    expect(loanPaymentTotals[carLoan.id].lifetimeInterest).toBe(1906.7196253547775);
    expect(loanPaymentTotals[homeLoan.id].lifetimeInterest).toBe(118982.16255675393);
    expect(loanPaymentTotals[otherLoan.id].lifetimeInterest).toBe(
      902.9214932489889
    );
    expect(loanPaymentTotals[constants.TOTALS].lifetimeInterest).toBe(121791.8036753577);
    expect(loanPaymentTotals[constants.TOTALS].amortizationSchedule.length).toBe(148);

    expect(loanPaymentTotals[constants.TOTALS].amortizationSchedule[110].principal).toBe(
      2562.3766649975837
    );
    expect(loanPaymentTotals[constants.TOTALS].amortizationSchedule[110].interest).toBe(
      464.943326784418
    );
    expect(
      loanPaymentTotals[constants.TOTALS].amortizationSchedule[110].principalRemaining
    ).toBe(101723.97700627374);

    expect(loanPaymentTotals[constants.TOTALS].amortizationSchedule[147].principal).toBe(
      1458.8921103989624
    );
    expect(loanPaymentTotals[constants.TOTALS].amortizationSchedule[147].interest).toBe(
      6.504227325528707
    );
    expect(
      loanPaymentTotals[constants.TOTALS].amortizationSchedule[147].principalRemaining
    ).toBe(0);
  });
});
