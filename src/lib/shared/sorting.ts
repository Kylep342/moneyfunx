/**
 *
 * This file contains functions for sorting Arrays of ILoans or IInstruments on certain attributes
 *
 */

export type HasRateAndBalance = { annualRate: number; currentBalance: number; };

type avalanche = (obj1: HasRateAndBalance, obj2: HasRateAndBalance) => number;
type snowball = (obj1: HasRateAndBalance, obj2: HasRateAndBalance) => number;
type sortFunction = avalanche | snowball;

/**
 * Sorts descending by interest rate
 * @param {HasRateAndBalance} obj1
 * @param {HasRateAndBalance} obj2
 * @returns {number} the order in which to sort the objects in descending interestRate
 */
export function avalanche(obj1: HasRateAndBalance, obj2: HasRateAndBalance): number {
  return obj2.annualRate - obj1.annualRate;
}

/**
 * Sorts ascending by principal
 * @param {HasRateAndBalance} obj1
 * @param {HasRateAndBalanceILoan} obj2
 * @returns {number} the order in which to sort the objects in ascending currentBalance
 */
export function snowball(obj1: HasRateAndBalance, obj2: HasRateAndBalance): number {
  return obj1.currentBalance - obj2.currentBalance;
}

/**
 * Sorts a collection (<HasRateAndBalalnce>) using the provided sortFunction
 * @param {HasRateAndBalance[]} sortable The collection to sort
 * @param {function} sortFunction The algorithm to sort the collection with
 * @returns The sorted collection
 */
export function sortWith(sortable: HasRateAndBalance[], sortFunction: sortFunction): HasRateAndBalance[] {
  return sortable.sort(sortFunction);
}
