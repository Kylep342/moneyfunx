/**
 *
 * This file contains functions for computing detailed information on paying loans
 *
 */

import * as errors from './errors';
import * as helpers from './helperFunctions';
import type { ILoan, Loan } from './loan';
import type {
  AmortizationRecord,
  LoanPrincipals,
  LoansPaymentSchedule,
} from './paymentTypes';

/**
 *
 * Calculates the extra amount in a payment after all loans' minimum payments are met
 * Throws an exception if the payment provided is less than the collective minimum payments for all loans
 *
 * @param {ILoan[]} loans The loans to allocate minimum payments
 * @param {number} payment The amount to pay across all loans
 * @returns {number} The extra amount of payment
 */
export function determineExtraPayment(
  loans: ILoan[],
  payment: number
): number {
  const totalMinPayment = loans.reduce(
    (previousValue, currentValue) => previousValue + currentValue.minPayment,
    0
  );
  // hack to get around floating precision adjustments
  if (parseInt((100 * totalMinPayment).toFixed()) > parseInt((100 * payment).toFixed())) {
    throw new errors.PaymentTooLowError(
      `Payment amount of ${payment} must be greater than ${totalMinPayment}`
    );
  }
  return payment - totalMinPayment;
}

/**
 *
 * Calculates the amortization schedule for a loan paid with a payment
 *
 * @param {Loan} loan The loan to amortize payments for
 * @param {number} principal The amount borrowed
 * @param {number} payment The amount to pay to the loan's balance each period
 * @param {number} numPayments The number of periods to make payments to the loan
 * @param {number} startPeriod An initial offset of periods to 'fast-forward' the state of the loan to prior to calculation of each period
 * @param {number} carryover An additional amount to pay towards a loan, used when a residual amount is available from paying off the previous loan this period
 * @returns {AmortizationRecord[]} The amortization schdule for the number of payments of payment made to the loan from the provided start period
 */
export function amortizePayments(
  loan: Loan,
  principal: number,
  payment: number,
  numPayments: number,
  startPeriod: number = 0,
  carryover: number = 0
): AmortizationRecord[] {
  if (payment === null) {
    payment = loan.minPayment;
  }
  payment = loan.validatePayment(payment);

  if (numPayments === null) {
    numPayments = loan.numPaymentsToZero(payment);
  }

  let principalRemaining = principal;

  const amortizationSchedule: AmortizationRecord[] = [];
  for (let period = 0; period < numPayments; period++) {
    const interestThisPeriod = loan.accrueInterest(principalRemaining);
    const principalThisPeriod = Math.min(
      (period === numPayments - 1
        ? payment + carryover
        : payment) - interestThisPeriod,
      principalRemaining
    );
    principalRemaining -= principalThisPeriod;
    amortizationSchedule.push({
      period: startPeriod + period + 1,
      principal: principalThisPeriod,
      interest: interestThisPeriod,
      principalRemaining,
    });
  }
  return amortizationSchedule;
}

/**
 *
 * Calculates a wealth of information about paying of a set of loans with a total payment amount
 *
 * @param {Loan[]} loans The loans to pay off
 * @param {number} payment The total amount of money budgeted to pay all loans each period
 * @param {boolean} reduceMinimum Flag to reduce the total payment amount by a loan's minimum when that loan is paid off
 * @returns {LoansPaymentSchedule} Various totals and series of data regarding paying off the loans at the payment amount
 *
 */
export function payLoans(
  loans: Loan[],
  payment: number,
  reduceMinimum: boolean = false
): LoansPaymentSchedule {
  let monthlyPayment = payment;
  const paymentSchedule: LoansPaymentSchedule = {};
  const loanPrincipalsRemaining: LoanPrincipals = {};
  loans.forEach((loan) => {
    paymentSchedule[loan.id] = {
      lifetimeInterest: 0,
      lifetimePrincipal: loan.currentBalance,
      amortizationSchedule: []
    };
    loanPrincipalsRemaining[loan.id] = loan.currentBalance;
  });

  let periodsElapsed = 0;
  let paidLoans = 0;
  let totalLifetimeInterest = 0;
  let totalLifetimePrincipal = 0;
  let totalAmortizationSchedule: AmortizationRecord[] = [];

  while (paidLoans < loans.length) {
    const firstLoan = loans.slice(paidLoans)[0];
    const firstLoanPayment =
      firstLoan.minPayment +
      determineExtraPayment(loans.slice(paidLoans), monthlyPayment);
    const firstLoanPrincipalRemaining = loanPrincipalsRemaining[firstLoan.id];
    const periodsToPay = firstLoan.numPaymentsToZero(
      firstLoanPayment,
      firstLoanPrincipalRemaining,
    );
    const firstLoanAmortizedPayments = amortizePayments(
      firstLoan,
      firstLoanPrincipalRemaining,
      firstLoanPayment,
      periodsToPay,
      periodsElapsed
    );
    const firstLoanCarryover = firstLoanPayment - (
      firstLoan.principalRemaining(
        periodsToPay - 1,
        firstLoanPayment,
        firstLoanPrincipalRemaining
      ) + firstLoan.accrueInterest(
        firstLoan.principalRemaining(
          periodsToPay - 1,
          firstLoanPayment,
          firstLoanPrincipalRemaining
        )
      )
    );
    paymentSchedule[firstLoan.id].amortizationSchedule = [
      ...paymentSchedule[firstLoan.id].amortizationSchedule,
      ...firstLoanAmortizedPayments
    ];
    totalAmortizationSchedule = [
      ...totalAmortizationSchedule,
      ...firstLoanAmortizedPayments
    ];
    paidLoans += 1;
    // handle calculating information for the rest of the loans
    loans.slice(paidLoans).forEach((loan, index) => {
      const loanPrincipalRemaining = loanPrincipalsRemaining[loan.id];
      const amortizedPayments = amortizePayments(
        loan,
        loanPrincipalRemaining,
        loan.minPayment,
        Math.min(
          periodsToPay,
          loan.numPaymentsToZero(
            loan.minPayment,
            loanPrincipalRemaining,
          ),
        ),
        periodsElapsed,
        // bug
        // when loan 1 is paid off with overkill on the final payment,
        // loan 2 is not getting the extra over the global minimum for that payment
        // i.e. needs to trickle down to #2
        (index === 0 && !reduceMinimum) ? firstLoanCarryover : 0
      );
      paymentSchedule[loan.id].amortizationSchedule = [
        ...paymentSchedule[loan.id].amortizationSchedule,
        ...amortizedPayments,
      ];

      loanPrincipalsRemaining[loan.id] = paymentSchedule[
        loan.id
      ].amortizationSchedule[
        paymentSchedule[loan.id].amortizationSchedule.length - 1
      ].principalRemaining;

      totalAmortizationSchedule = totalAmortizationSchedule.map((element) => {
        const matchedInnerElement = amortizedPayments.find(
          (innerElement) => innerElement.period === element.period
        );
        return (matchedInnerElement != null)
          ? {
            period: element.period,
            principal: element.principal + matchedInnerElement.principal,
            interest: element.interest + matchedInnerElement.interest,
            principalRemaining:
              element.principalRemaining +
              matchedInnerElement.principalRemaining
          }
          : element;
      });
    });

    if (reduceMinimum) {
      monthlyPayment -= firstLoan.minPayment;
    }
    periodsElapsed += periodsToPay;
  }

  for (const loan of loans) {
    const loanLifetimeInterest = (
      paymentSchedule[loan.id].amortizationSchedule.reduce(
        (lifetimeInterest, curval) => lifetimeInterest + curval.interest,
        0
      )
    );
    paymentSchedule[loan.id].lifetimeInterest = loanLifetimeInterest;
    paymentSchedule[loan.id].lifetimePrincipal = loan.principal;
    totalLifetimeInterest += loanLifetimeInterest;
    totalLifetimePrincipal += loan.principal;
  }

  paymentSchedule.totals = {
    lifetimeInterest: totalLifetimeInterest,
    lifetimePrincipal: totalLifetimePrincipal,
    amortizationSchedule: totalAmortizationSchedule
  };

  return paymentSchedule;
}
