import { describe, expect, it } from 'vitest';

import * as constants from '../../src/lib/constants';
import { Loan } from '../../src/lib/debt/loan';
import * as payments from '../../src/lib/debt/payments';
import { PaymentRecord } from '../../src/lib/debt/paymentTypes';
import * as sorting from '../../src/lib/shared/sorting';

const Loans = (): Loan[] => [
  new Loan(314159_26n, 53500n, 12, 15, 'pi-house'),
  new Loan(27182_81n, 82800n, 12, 4, 'e-car', 23456_78n),
  new Loan(10000_00n, 62800n, 12, 3, 'tau', undefined, 300_00n),
];

describe('payments module', () => {
  const [homeLoan, carLoan, otherLoan] = Loans();

  const loansAV = sorting.sortWith([otherLoan, homeLoan, carLoan], sorting.avalanche);

  it('amortizes a single loan', async () => {
    const homeLoanAmortizationSchedule = payments.amortizePayments(
      homeLoan,
      homeLoan.principal,
      null,
      null
    );

    expect(homeLoanAmortizationSchedule.length).toBe(180);
    expect(homeLoanAmortizationSchedule[3].period).toBe(4);
    expect(homeLoanAmortizationSchedule[3].principal).toBe(1156_72n);
    expect(homeLoanAmortizationSchedule[3].interest).toBe(1385_29n);
    expect(homeLoanAmortizationSchedule[3].principalRemaining).toBe(309563_11n);
    expect(homeLoanAmortizationSchedule[119].period).toBe(120);
    expect(homeLoanAmortizationSchedule[119].principal).toBe(1937_90n);
    expect(homeLoanAmortizationSchedule[119].interest).toBe(604_11n);
    expect(homeLoanAmortizationSchedule[119].principalRemaining).toBe(133564_13n);
    expect(homeLoanAmortizationSchedule[179].period).toBe(180);
    expect(homeLoanAmortizationSchedule[179].principal).toBe(2529_59n);
    expect(homeLoanAmortizationSchedule[179].interest).toBe(11_28n);
    expect(homeLoanAmortizationSchedule[179].principalRemaining).toBe(0n);
  });

  it('determines extra payment for multiple loans', async () => {
    expect(payments.determineExtraPayment(loansAV, 3700_00n)).toBe(176_13n); // $176.13
  });

  it('throws a paymentTooLowError when the total payment for loans is below their shared minimum', async () => {
    const tooLowPayment = 2800_00n;
    expect(() => {
      payments.determineExtraPayment(loansAV, tooLowPayment);
    }).toThrow(`Payment amount of ${tooLowPayment} must be greater than 352387`);
  });

  it('determines carryover', async () => {
    expect(payments.determineCarryover(
        carLoan,
        1867_19n,
        348_33n,
        false
      )).toBe(1518_86n);
    expect(payments.determineCarryover(
        carLoan,
        1867_19n,
        348_33n,
        true
      )).toBe(851_66n);
  });

  it('amortizes payments for mutliple loans', async () => {
    const loansPaymentSummary = payments.payLoans(loansAV, 4000_00n);

    for (const loanAV of loansAV) {
      expect(loansPaymentSummary[loanAV.id].lifetimeInterest).toBe(
        loansPaymentSummary[loanAV.id].amortizationSchedule
          .reduce((acc: bigint, cv: PaymentRecord) => acc + cv.interest, 0n)
      );
    }

    // 2 keys more than the 3 loans for totalInterest and totalPayments
    expect(Object.keys(loansPaymentSummary).length).toBe(4);
    expect(loansPaymentSummary[carLoan.id].lifetimeInterest).toBe(1923_51n);
    expect(loansPaymentSummary[homeLoan.id].lifetimeInterest).toBe(91586_90n);
    expect(loansPaymentSummary[otherLoan.id].lifetimeInterest).toBe(863_88n);

    expect(loansPaymentSummary[constants.TOTALS].lifetimeInterest).toBe(94374_29n);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule.length).toBe(111);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[110].principal).toBe(1981_50n);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[110].interest).toBe(8_83n);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[110].principalRemaining).toBe(0n);
  });

  it('reduces minimum payments correctly and amortizes payments for multiple loans', async () => {
    const loansPaymentSummary = payments.payLoans(loansAV, 4000_00n, true);

    for (const loanAV of loansAV) {
      expect(loansPaymentSummary[loanAV.id].lifetimeInterest).toBe(
        loansPaymentSummary[loanAV.id].amortizationSchedule
          .reduce((acc: bigint, cv: PaymentRecord) => acc + cv.interest, 0n)
      );
    }

    expect(Object.keys(loansPaymentSummary).length).toBe(4);
    expect(loansPaymentSummary[carLoan.id].lifetimeInterest).toBe(1923_51n);
    expect(loansPaymentSummary[homeLoan.id].lifetimeInterest).toBe(119342_69n);
    expect(loansPaymentSummary[otherLoan.id].lifetimeInterest).toBe(890_44n);

    expect(loansPaymentSummary[constants.TOTALS].lifetimeInterest).toBe(122156_64n);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule.length).toBe(148);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[110].principal).toBe(2549_07n);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[110].interest).toBe(469_07n);
    expect(
      loansPaymentSummary[constants.TOTALS].amortizationSchedule[110].principalRemaining
    ).toBe(102663_20n);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[147].principal).toBe(2918_87n);
    expect(loansPaymentSummary[constants.TOTALS].amortizationSchedule[147].interest).toBe(13_01n);
    expect(
      loansPaymentSummary[constants.TOTALS].amortizationSchedule[147].principalRemaining
    ).toBe(0n);
  });
});
