/**
 *
 * This file contains functions for computing detailed information on paying loans
 *
 */

import * as errors from '../errors.js';
import { TOTALS } from '../constants.js';
import type { ILoan, Loan } from '../debt/loan.js';
import type {
  PaymentRecord,
  LoanPrincipals,
  LoansPaymentSchedule,
} from '../debt/paymentTypes.js';

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
    (accumulator, loan) => accumulator + loan.minPayment,
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
 * Calculates the carryover amount from loan N to loan N+1
 *
 * @param {Loan} loan The loan serving as the base for carryover
 * @param {number} loanPayment The payment applied to the loan
 * @param {number} loanFinalPayment The (partial) amount of the final payment to the loan
 * @param {boolean} reduceMinimum Flag to reduce the total payment amount by a loan's minimum when that loan is paid off
 * @returns {number} The carryover to apply to the last payment on loan N+1
 */
export function determineCarryover(
  loan: Loan,
  loanPayment: number,
  loanFinalPayment: number,
  reduceMinimum: boolean,
): number {
  switch (true) {
    case reduceMinimum:
      return Math.max(loanPayment - loanFinalPayment - loan.minPayment, 0);
    default:
      return Math.max(loanPayment - loanFinalPayment, 0);
  }
}

/**
 *
 * Calculates the amortization schedule for a loan paid with a payment
 *
 * @param {Loan} loan The loan to amortize payments for
 * @param {number} principal The amount borrowed
 * @param {number|null} payment The amount to pay to the loan's balance each period
 * @param {number|null} numPayments The number of periods to make payments to the loan
 * @param {number} startPeriod An initial offset of periods to 'fast-forward' the state of the loan to prior to calculation of each period
 * @param {number} carryover An additional amount to pay towards a loan, used when a residual amount is available from paying off the previous loan this period
 * @returns {PaymentRecord[]} The amortization schedule for the number of payments of payment made to the loan from the provided start period
 */
export function amortizePayments(
  loan: Loan,
  principal: number,
  payment: number | null,
  numPayments: number | null,
  startPeriod: number = 0,
  carryover: number = 0
): PaymentRecord[] {
  // Strict null check handling
  let actualPayment: number = (payment !== null) ? payment : loan.minPayment;
  actualPayment = loan.validatePayment(actualPayment);

  let actualNumPayments: number = (numPayments !== null) ? numPayments : loan.numPaymentsToZero(actualPayment);

  const amortizationSchedule: PaymentRecord[] = [];
  let principalRemaining = principal;

  for (let period = 0; period < actualNumPayments; period++) {
    const interestThisPeriod = loan.accrueInterest(principalRemaining);
    const principalThisPeriod = Math.min(
      (period === actualNumPayments - 1
        ? actualPayment + carryover
        : actualPayment) - interestThisPeriod,
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
      amortizationSchedule: [],
    };
    loanPrincipalsRemaining[loan.id] = loan.currentBalance;
  });

  let periodsElapsed = 0;
  let paidLoans = 0;
  let totalLifetimeInterest = 0;
  let totalLifetimePrincipal = 0;
  let totalAmortizationSchedule: PaymentRecord[] = [];

  while (paidLoans < loans.length) {
    const activeLoans = loans.slice(paidLoans);
    const firstLoan = activeLoans[0];
    
    // 1. Determine the "Driver" parameters (the loan being paid off in this chunk)
    const firstLoanPayment = (
      firstLoan.minPayment +
      determineExtraPayment(activeLoans, monthlyPayment)
    );
    const firstLoanPrincipalRemaining = loanPrincipalsRemaining[firstLoan.id];
    
    // How long does this chunk last?
    const periodsToPay = firstLoan.numPaymentsToZero(
      firstLoanPayment,
      firstLoanPrincipalRemaining,
    );

    // 2. Calculate the Final Payment specifics for the driver loan
    //    (Needed for carryover calculation)
    const finalPrincipal = firstLoan.principalRemaining(
      periodsToPay - 1,
      firstLoanPayment,
      firstLoanPrincipalRemaining
    );
    const firstLoanFinalPayment = finalPrincipal + firstLoan.accrueInterest(finalPrincipal);

    // 3. Process ALL active loans for this chunk of time
    activeLoans.forEach((loan, index) => {
      const isDriverLoan = index === 0;
      const loanPrincipalRemaining = loanPrincipalsRemaining[loan.id];
      
      // Determine payment amount: Driver gets extra, others get minimum
      const paymentAmount = isDriverLoan ? firstLoanPayment : loan.minPayment;
      
      // Determine duration: Others are capped by the Driver's time-to-zero
      const duration = isDriverLoan 
        ? periodsToPay 
        : Math.min(periodsToPay, loan.numPaymentsToZero(loan.minPayment, loanPrincipalRemaining));

      // Determine carryover: Only applies to the SECOND loan (index 1), derived from Driver
      const carryoverAmount = (index === 1) 
        ? determineCarryover(firstLoan, firstLoanPayment, firstLoanFinalPayment, reduceMinimum) 
        : 0;

      const loanAmortizedPayments = amortizePayments(
        loan,
        loanPrincipalRemaining,
        paymentAmount,
        duration,
        periodsElapsed,
        carryoverAmount
      );

      // A. Append to individual loan schedule
      paymentSchedule[loan.id].amortizationSchedule = [
        ...paymentSchedule[loan.id].amortizationSchedule,
        ...loanAmortizedPayments,
      ];

      // B. Merge into Total Schedule
      if (isDriverLoan) {
        // The Driver extends the timeline. We append its records to initialize the new period slots in Totals.
        totalAmortizationSchedule = [
          ...totalAmortizationSchedule,
          ...loanAmortizedPayments
        ];
      } else {
        // Followers merge into the existing slots created by the Driver.
        // We only map over the NEW segment of the total schedule to avoid re-scanning history (optional optimization),
        // but for safety/simplicity we map the whole structure and match by period.
        totalAmortizationSchedule = totalAmortizationSchedule.map((element) => {
          const matchedInnerElement = loanAmortizedPayments.find(
            (innerElement) => innerElement.period === element.period
          );
          return (matchedInnerElement != null)
            ? {
              period: element.period,
              principal: element.principal + matchedInnerElement.principal,
              interest: element.interest + matchedInnerElement.interest,
              principalRemaining: element.principalRemaining + matchedInnerElement.principalRemaining
            }
            : element;
        });
      }

      // Update tracking state for next iteration
      if (paymentSchedule[loan.id].amortizationSchedule.length > 0) {
        const fullSchedule = paymentSchedule[loan.id].amortizationSchedule;
        loanPrincipalsRemaining[loan.id] = fullSchedule[fullSchedule.length - 1].principalRemaining;
      }
    });

    paidLoans += 1;
    periodsElapsed += periodsToPay;
    
    if (reduceMinimum) {
      monthlyPayment -= firstLoan.minPayment;
    };
  }

  // Final Totals Calculation
  for (const loan of loans) {
    const loanLifetimeInterest = (
      paymentSchedule[loan.id].amortizationSchedule.reduce(
        (lifetimeInterest: number, record: PaymentRecord) => lifetimeInterest + record.interest,
        0
      )
    );
    paymentSchedule[loan.id].lifetimeInterest = loanLifetimeInterest;
    paymentSchedule[loan.id].lifetimePrincipal = loan.currentBalance;
    totalLifetimeInterest += loanLifetimeInterest;
    totalLifetimePrincipal += loan.currentBalance;
  }

  paymentSchedule[TOTALS] = {
    lifetimeInterest: totalLifetimeInterest,
    lifetimePrincipal: totalLifetimePrincipal,
    amortizationSchedule: totalAmortizationSchedule,
  };

  return paymentSchedule;
}
