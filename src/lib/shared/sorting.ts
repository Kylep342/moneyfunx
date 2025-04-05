/**
 *
 * This file contains functions for sorting Arrays of ILoans or IInstruments on certain attributes
 *
 */

export type HasRateAndBalance = { annualRate: number; currentBalance: number; };

type sortFunction = (obj1: HasRateAndBalance, obj2: HasRateAndBalance) => number;
type avalanche = (obj1: HasRateAndBalance, obj2: HasRateAndBalance) => number;
type snowball = (obj1: HasRateAndBalance, obj2: HasRateAndBalance) => number;

/**
 * Sorts descending by interest rate
 * @param {T extends HasRateAndBalance} obj1
 * @param {T extends HasRateAndBalance} obj2
 * @returns {number} the order in which to sort the objects in descending interestRate
 */
export function avalanche<T extends HasRateAndBalance>(obj1: T, obj2: T): number {
  return obj2.annualRate - obj1.annualRate;
}

/**
 * Sorts ascending by principal
 * @param {T extends HasRateAndBalance} obj1
 * @param {T extends HasRateAndBalanceILoan} obj2
 * @returns {number} the order in which to sort the objects in ascending currentBalance
 */
export function snowball<T extends HasRateAndBalance>(obj1: T, obj2: T): number {
  return obj1.currentBalance - obj2.currentBalance;
}

/**
 * Sorts a collection (<HasRateAndBalalnce>) using the provided sortFunction
 * @param {HasRateAndBalance[]} sortable The collection to sort
 * @param {function} sortFunction The algorithm to sort the collection with
 * @returns The sorted collection
 *
 */
export function sortWith<T extends HasRateAndBalance>(
  sortable: T[],
  sortFunction: sortFunction
):
T[] {
  return sortable.sort(sortFunction);
}
