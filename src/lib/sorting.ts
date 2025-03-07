/**
 *
 * This file contains functions for sorting Arrays of Loans on certain attributes
 *
 */

import { Loan } from './loan';

type avalanche = (loan1: Loan, loan2: Loan) => number;
type snowball = (loan1: Loan, loan2: Loan) => number;
type sortFunction = avalanche | snowball;

/**
 * Sorts loans descending by interest rate
 * @param {Loan} loan1 A loan to be comapred
 * @param {Loan} loan2 A loan to be comapred
 * @returns {number} the order in which to sort the loans in descending interest rate
 */
export function avalanche(loan1: Loan, loan2: Loan): number {
  return loan2.annualRate - loan1.annualRate;
}

/**
 * Sorts loans ascending by principal
 * @param {Loan} loan1 A loan to be compared
 * @param {Loan} loan2 A loan to be compared
 * @returns {number} the order in which to sort the loans in ascending princpal
 */
export function snowball(loan1: Loan, loan2: Loan): number {
  return loan1.currentBalance - loan2.currentBalance;
}

/**
 * Sorts an array of loans using the provided sortFunc
 * @param {Array<Loan>} loans The loans to sort
 * @param {function} sortFunc The algorithm to sort the loans with
 * @returns The sorted array loans
 */
export function sortLoans(loans: Loan[], sortFunction: sortFunction): Loan[] {
  return loans.sort(sortFunction);
}
