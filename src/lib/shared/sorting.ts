/**
 * This file contains functions for sorting Arrays of ILoans or IInstruments on certain attributes
 * using pure BigInt math.
 */

export type HasRateAndBalance = {
  annualRate: bigint | ((period: number, balance: bigint) => bigint);
  currentBalance: bigint;
};

type sortFunction = (obj1: HasRateAndBalance, obj2: HasRateAndBalance) => number;

/**
 * Sorts descending by interest rate.
 *
 * @param {T extends HasRateAndBalance} obj1
 * @param {T extends HasRateAndBalance} obj2
 * @returns {number} the order in which to sort the objects in descending interestRate
 */
export function avalanche<T extends HasRateAndBalance>(obj1: T, obj2: T): number {
  const rate1 = typeof obj1.annualRate === 'function' ? obj1.annualRate(1, obj1.currentBalance) : obj1.annualRate;
  const rate2 = typeof obj2.annualRate === 'function' ? obj2.annualRate(1, obj2.currentBalance) : obj2.annualRate;
  const diff = rate2 - rate1;
  if (diff > 0n) return 1;
  if (diff < 0n) return -1;
  return 0;
}

/**
 * Sorts ascending by principal.
 *
 * @param {T extends HasRateAndBalance} obj1
 * @param {T extends HasRateAndBalance} obj2
 * @returns {number} the order in which to sort the objects in ascending currentBalance
 */
export function snowball<T extends HasRateAndBalance>(obj1: T, obj2: T): number {
  const diff = obj1.currentBalance - obj2.currentBalance;
  if (diff > 0n) return 1;
  if (diff < 0n) return -1;
  return 0;
}

/**
 * Sorts a collection using the provided sortFunction.
 *
 * @param {HasRateAndBalance[]} sortable The collection to sort
 * @param {function} sortFunction The algorithm to sort the collection with
 * @returns The sorted collection
 */
export function sortWith<T extends HasRateAndBalance>(
  sortable: T[],
  sortFunction: sortFunction
): T[] {
  return sortable.sort(sortFunction);
}
