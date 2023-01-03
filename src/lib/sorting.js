/**
 *
 * This file contains functions for sorting Arrays of Loans on certain attributes
 *
 */

/**
 * Sorts loans descending by interest rate
 * @param {Loan} loan1 A loan to be comapred
 * @param {Loan} loan2 A loan to be comapred
 * @returns {number} the order in which to sort the loans in descending interest rate
 */
export function avalanche(loan1, loan2) {
    return loan2.annualRate - loan1.annualRate;
}

/**
 * Sorts loans ascending by principal
 * @param {Loan} loan1 A loan to be compared
 * @param {Loan} loan2 A loan to be compared
 * @returns {number} the order in which to sort the loans in ascending princpal
 */
export function snowball(loan1, loan2) {
    return loan1.principal - loan2.principal;
}

/**
 * Sorts an array of loans using the provided sortFunc
 * @param {Array<Loan>} loans The loans to sort
 * @param {function} sortFunc The algorithm to sort the loans with
 * @returns The sorted array loans
 */
export function sortLoans(loans, sortFunc) {
    return loans.sort(sortFunc);
}
