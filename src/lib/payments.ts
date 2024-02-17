/**
 *
 * This file contains functions for computing detailed information on paying loans
 *
 */

import * as errors from "./errors";
import * as helpers from "./helperFunctions";
import type { ILoan, Loan } from "./loan";
import type {
  AmortizationRecord,
  LoanPrincipals,
  LoansPaymentSummary,
} from "./paymentTypes";

/**
 *
 * Calculates the extra amount in a payment after all loans' minimum payments are met
 * Throws an exception if the payment provided is less than the collective minimum payments for all loans
 *
 * @param {Array<Loan>} loans The loans to allocate minimum payments
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
  if (parseFloat(totalMinPayment.toFixed(2)) > parseFloat(payment.toFixed(2))) {
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
 * @param {number} payment The amount to pay to the loan's balance each period
 * @param {number} numPayments The number of periods to make payments to the loan
 * @param {number} startPeriod An initial offset of periods to "fast-forward" the state of the loan to prior to calculation of each period
 * @returns {Array<AmortizationRecord>} The amortization schdule for the number of payments of payment made to the loan from the provided start period
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
 * @param {Array<Loans>} loans The loans to pay off
 * @param {number} payment The total amount of money budgeted to pay all loans each period
 * @param {boolean} reduceMinimum Flag to reduce the total payment amount by a loan's minimum when that loan is paid off
 * @returns {LoansPaymentSummary} Various totals and series of data regarding paying off the loans at the payment amount
 *
 */
export function payLoans(
  loans: Loan[],
  payment: number,
  reduceMinimum: boolean = false
): LoansPaymentSummary {
  let monthlyPayment = payment;
  const paymentData: LoansPaymentSummary = {};
  const loanPrincipalsRemaining: LoanPrincipals = {};
  loans.forEach((loan) => {
    paymentData[loan.id] = {
      lifetimeInterest: 0,
      lifetimePrincipal: loan.principal,
      amortizationSchedule: []
    };
    loanPrincipalsRemaining[loan.id] = loan.principal;
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
    const periodsToPay = helpers.numPaymentsToZero(
      firstLoanPrincipalRemaining,
      firstLoanPayment,
      firstLoan.periodicRate
    );
    const firstLoanPaidPeriods = amortizePayments(
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
    paymentData[firstLoan.id].amortizationSchedule = [
      ...paymentData[firstLoan.id].amortizationSchedule,
      ...firstLoanPaidPeriods
    ];
    totalAmortizationSchedule = [
      ...totalAmortizationSchedule,
      ...firstLoanPaidPeriods
    ];
    paidLoans += 1;
    // handle calculating information for the rest of the loans
    loans.slice(paidLoans).forEach((loan, index) => {
      const loanPrincipalRemaining = loanPrincipalsRemaining[loan.id];
      const paidPeriods = amortizePayments(
        loan,
        loanPrincipalRemaining,
        loan.minPayment,
        periodsToPay,
        periodsElapsed,
        index === 0 ? firstLoanCarryover : 0
      );
      paymentData[loan.id].amortizationSchedule = [
        ...paymentData[loan.id].amortizationSchedule,
        ...paidPeriods,
      ];

      loanPrincipalsRemaining[loan.id] = paymentData[
        loan.id
      ].amortizationSchedule[
        paymentData[loan.id].amortizationSchedule.length - 1
      ].principalRemaining;

      totalAmortizationSchedule = totalAmortizationSchedule.map((element) => {
        const matchedInnerElement = paidPeriods.find(
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
      paymentData[loan.id].amortizationSchedule.reduce(
        (acc, curval) => acc + curval.interest,
        0
      )
    );
    paymentData[loan.id].lifetimeInterest = loanLifetimeInterest;
    paymentData[loan.id].lifetimePrincipal = loan.principal;
    totalLifetimeInterest += loanLifetimeInterest;
    totalLifetimePrincipal += loan.principal;
  }

  paymentData.totals = {
    lifetimeInterest: totalLifetimeInterest,
    lifetimePrincipal: totalLifetimePrincipal,
    amortizationSchedule: totalAmortizationSchedule
  };

  return paymentData;
}
