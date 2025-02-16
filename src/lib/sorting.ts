/**
 *
 * This file contains functions for sorting Arrays of ILoans on certain attributes
 *
 */

import { ILoan } from './loan';

type avalanche = (loan1: ILoan, loan2: ILoan) => number;
type snowball = (loan1: ILoan, loan2: ILoan) => number;
type sortFunction = avalanche | snowball;

/**
 * Sorts loans descending by interest rate
 * @param {ILoan} loan1 A loan to be comapred
 * @param {ILoan} loan2 A loan to be comapred
 * @returns {number} the order in which to sort the loans in descending interest rate
 */
export function avalanche(loan1: ILoan, loan2: ILoan): number {
  return loan2.annualRate - loan1.annualRate;
}

/**
 * Sorts loans ascending by principal
 * @param {ILoan} loan1 A loan to be compared
 * @param {ILoan} loan2 A loan to be compared
 * @returns {number} the order in which to sort the loans in ascending princpal
 */
export function snowball(loan1: ILoan, loan2: ILoan): number {
  return loan1.currentBalance - loan2.currentBalance;
}

/**
 * Sorts an array of loans using the provided sortFunc
 * @param {ILoan[]} loans The loans to sort
 * @param {function} sortFunc The algorithm to sort the loans with
 * @returns The sorted array loans
 */
export function sortLoans(loans: ILoan[], sortFunction: sortFunction): ILoan[] {
  return loans.sort(sortFunction);
}
