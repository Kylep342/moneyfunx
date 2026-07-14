/**
 * This file contains functions for computing detailed information on paying loans
 * using pure BigInt math.
 */

import * as errors from '../errors.js';
import { TOTALS } from '../constants.js';
import type { ILoan, Loan } from '../debt/loan.js';
import * as primitives from '../shared/primitives.js';
import type {
  PaymentRecord,
  LoanPrincipals,
  LoansPaymentSchedule,
} from '../debt/paymentTypes.js';

/**
 * Calculates the extra amount in a payment after all loans' minimum payments are met.
 * Throws an exception if the payment provided is less than the collective minimum payments for all loans.
 *
 * @param {ILoan[]} loans The loans to allocate minimum payments
 * @param {bigint} payment The amount to pay across all loans (in cents)
 * @returns {bigint} The extra amount of payment (in cents)
 */
export function determineExtraPayment(
  loans: ILoan[],
  payment: bigint
): bigint {
  const totalMinPayment = loans.reduce((accumulator, loan) => accumulator + loan.minPayment, 0n);
  if (totalMinPayment > payment) {
    throw new errors.PaymentTooLowError(
      `Payment amount of ${payment} must be greater than ${totalMinPayment}`
    );
  }
  return payment - totalMinPayment;
}

/**
 * Calculates the carryover amount from loan N to loan N+1.
 *
 * @param {Loan} loan The loan serving as the base for carryover
 * @param {bigint} loanPayment The payment applied to the loan (in cents)
 * @param {bigint} loanFinalPayment The (partial) amount of the final payment to the loan (in cents)
 * @param {boolean} reduceMinimum Flag to reduce the total payment amount by a loan's minimum when that loan is paid off
 * @returns {bigint} The carryover to apply to the last payment on loan N+1 (in cents)
 */
export function determineCarryover(
  loan: Loan,
  loanPayment: bigint,
  loanFinalPayment: bigint,
  reduceMinimum: boolean,
): bigint {
  if (reduceMinimum) {
    const diff = loanPayment - loanFinalPayment - loan.minPayment;
    return diff > 0n ? diff : 0n;
  } else {
    const diff = loanPayment - loanFinalPayment;
    return diff > 0n ? diff : 0n;
  }
}

/**
 * Calculates the amortization schedule for a loan paid with a payment.
 *
 * @param {Loan} loan The loan to amortize payments for
 * @param {bigint} principal The amount borrowed (in cents)
 * @param {primitives.PaymentScheduleInput | null} payment The amount to pay to the loan's balance each period or generator
 * @param {number | null} numPayments The number of periods to make payments to the loan
 * @param {number} startPeriod An initial offset of periods to 'fast-forward' the state of the loan prior to calculation of each period
 * @param {bigint} carryover An additional amount to pay towards a loan, used when a residual amount is available from paying off the previous loan this period
 * @returns {PaymentRecord[]} The amortization schedule (in cents)
 */
export function amortizePayments(
  loan: Loan,
  principal: bigint,
  payment: primitives.PaymentScheduleInput | null,
  numPayments: number | null,
  startPeriod: number = 0,
  carryover: bigint = 0n
): PaymentRecord[] {
  const paymentStream = primitives.getPaymentStream(payment, loan.minPayment)();

  if (typeof payment === 'bigint') {
    loan.validatePayment(payment);
  }

  const actualNumPayments: number = (numPayments !== null)
    ? numPayments
    : loan.numPaymentsToZero(payment || loan.minPayment, principal, startPeriod);

  const amortizationSchedule: PaymentRecord[] = [];
  let principalRemaining = principal;

  for (let period = 0; period < actualNumPayments; period++) {
    const currentPeriod = startPeriod + period + 1;
    const interestThisPeriod = loan.accrueInterest(principalRemaining, currentPeriod);

    const nextPay = paymentStream.next({ period: currentPeriod, balance: principalRemaining });
    const payVal = nextPay.done ? 0n : nextPay.value;

    const paymentThisPeriod = period === actualNumPayments - 1
      ? payVal + carryover
      : payVal;

    // $1.00 in cents is 100n
    const isFinalPayment = principalRemaining <= (paymentThisPeriod - interestThisPeriod + 100n);

    const principalThisPeriod = isFinalPayment
      ? principalRemaining
      : (paymentThisPeriod - interestThisPeriod < principalRemaining ? paymentThisPeriod - interestThisPeriod : principalRemaining);

    principalRemaining = principalRemaining - principalThisPeriod;
    amortizationSchedule.push({
      period: currentPeriod,
      principal: principalThisPeriod,
      interest: interestThisPeriod,
      principalRemaining,
    });
  }
  return amortizationSchedule;
}

/**
 * Calculates a wealth of information about paying off a set of loans with a total payment amount.
 *
 * @param {Loan[]} loans The loans to pay off
 * @param {bigint} payment The total amount of money budgeted to pay all loans each period (in cents)
 * @param {boolean} reduceMinimum Flag to reduce the total payment amount by a loan's minimum when that loan is paid off
 * @returns {LoansPaymentSchedule} Various totals and series of data regarding paying off the loans at the payment amount
 */
export function payLoans(
  loans: Loan[],
  payment: bigint,
  reduceMinimum: boolean = false
): LoansPaymentSchedule {
  let monthlyPayment = payment;
  const paymentSchedule: LoansPaymentSchedule = {};
  const loanPrincipalsRemaining: LoanPrincipals = {};

  loans.forEach((loan) => {
    paymentSchedule[loan.id] = {
      lifetimeInterest: 0n,
      lifetimePrincipal: loan.currentBalance,
      amortizationSchedule: [],
    };
    loanPrincipalsRemaining[loan.id] = loan.currentBalance;
  });

  let periodsElapsed = 0;
  let paidLoans = 0;
  let totalLifetimeInterest = 0n;
  let totalLifetimePrincipal = 0n;
  let totalAmortizationSchedule: PaymentRecord[] = [];

  while (paidLoans < loans.length) {
    const activeLoans = loans.slice(paidLoans);
    const firstLoan = activeLoans[0];
    
    const firstLoanPayment = (
      firstLoan.minPayment +
      determineExtraPayment(activeLoans, monthlyPayment)
    );
    const firstLoanPrincipalRemaining = loanPrincipalsRemaining[firstLoan.id];
    
    const periodsToPay = firstLoan.numPaymentsToZero(
      firstLoanPayment,
      firstLoanPrincipalRemaining,
      periodsElapsed
    );

    const finalPrincipal = firstLoan.principalRemaining(
      periodsToPay - 1,
      firstLoanPayment,
      firstLoanPrincipalRemaining,
      periodsElapsed
    );
    const firstLoanFinalPayment = finalPrincipal + firstLoan.accrueInterest(finalPrincipal, periodsElapsed + periodsToPay);

    activeLoans.forEach((loan, index) => {
      const isDriverLoan = index === 0;
      const loanPrincipalRemaining = loanPrincipalsRemaining[loan.id];
      
      const paymentAmount = isDriverLoan ? firstLoanPayment : loan.minPayment;
      
      const duration = isDriverLoan 
        ? periodsToPay 
        : Math.min(periodsToPay, loan.numPaymentsToZero(loan.minPayment, loanPrincipalRemaining, periodsElapsed));

      const carryoverAmount = (index === 1) 
        ? determineCarryover(firstLoan, firstLoanPayment, firstLoanFinalPayment, reduceMinimum) 
        : 0n;

      const loanAmortizedPayments = amortizePayments(
        loan,
        loanPrincipalRemaining,
        paymentAmount,
        duration,
        periodsElapsed,
        carryoverAmount
      );

      paymentSchedule[loan.id].amortizationSchedule = [
        ...paymentSchedule[loan.id].amortizationSchedule,
        ...loanAmortizedPayments,
      ];

      if (isDriverLoan) {
        totalAmortizationSchedule = [
          ...totalAmortizationSchedule,
          ...loanAmortizedPayments
        ];
      } else {
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

      if (paymentSchedule[loan.id].amortizationSchedule.length > 0) {
        const fullSchedule = paymentSchedule[loan.id].amortizationSchedule;
        loanPrincipalsRemaining[loan.id] = fullSchedule[fullSchedule.length - 1].principalRemaining;
      }
    });

    paidLoans += 1;
    periodsElapsed += periodsToPay;
    
    if (reduceMinimum) {
      monthlyPayment -= firstLoan.minPayment;
    }
  }

  for (const loan of loans) {
    const loanLifetimeInterest = paymentSchedule[loan.id].amortizationSchedule.reduce(
      (lifetimeInterest: bigint, record: PaymentRecord) => lifetimeInterest + record.interest,
      0n
    );
    paymentSchedule[loan.id].lifetimeInterest = loanLifetimeInterest;
    paymentSchedule[loan.id].lifetimePrincipal = loan.currentBalance;
    totalLifetimeInterest = totalLifetimeInterest + loanLifetimeInterest;
    totalLifetimePrincipal = totalLifetimePrincipal + loan.currentBalance;
  }

  paymentSchedule[TOTALS] = {
    lifetimeInterest: totalLifetimeInterest,
    lifetimePrincipal: totalLifetimePrincipal,
    amortizationSchedule: totalAmortizationSchedule,
  };

  return paymentSchedule;
}
