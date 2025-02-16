/**
 * Helper Functions
 *
 * These functions are inner primitives used in lifecycle calculations for Loans
 */

/**
 * Calculates the minimum payment to pay the principal back in the number of periods at the periodic rate
 *
 * @param {number} principal The amount borrowed
 * @param {number} periodicRate The rate the principal accrues interest at per period
 * @param {number [int]} periods The number of periods the principal is repaid over
 * @returns {number} The minimum payment
 */
export function calculateMinPayment(
  principal: number,
  periodicRate: number,
  periods: number
): number {
  return periodicRate > 0
    ? principal *
    ((periodicRate * (1 + periodicRate) ** periods) /
      ((1 + periodicRate) ** periods - 1))
    : principal / periods;
}

/**
 * Calculates the principal remaining after a certain number of payments from a beginning principal at a periodic rate
 *
 * @param {number} principal The amount borrowed
 * @param {number} payment The amount paid at each period
 * @param {number} periodicRate The rate the princpal accrues interest at per period
 * @param {number [int]} periods The number of periods paid to compute the desired principal remaining
 * @returns  {number} The remaining principal
 */
export function principalRemaining(
  principal: number,
  payment: number,
  periodicRate: number,
  periods: number
): number {
  return Math.max(
    (principal * (1 + periodicRate) ** periods) -
    (payment * ((1 + periodicRate) ** periods - 1) / periodicRate),
    0
  );
}

/**
 * Calculates the total interest paid after a certain number of payments from a beginning principal at a periodic rate
 *
 * @param {number} principal The amount borrowed
 * @param {number} payment The amount paid at each period
 * @param {number} periodicRate The rate the princpal accrues interest at per period
 * @param {number [int]} periods The number of periods paid to compute the desired principal remaining
 * @returns  {number} The total interest paid
 */
export function interestPaid(
  principal: number,
  payment: number,
  periodicRate: number,
  periods: number
): number {
  return (
    payment * periods -
    (principal - principalRemaining(principal, payment, periodicRate, periods))
  );
}

/**
 * Calculates the number of payments required to pay off a principal
 *
 * @param {number} principal The amount borrowed
 * @param {number} payment The amount paid at each period
 * @param {number} periodicRate The rate the princpal accrues interest at per period
 * @returns The number of payments needed to pay off the principal
 */
export function numPaymentsToZero(
  principal: number,
  payment: number,
  periodicRate: number
): number {
  return Math.ceil(
    Math.log(payment / (payment - principal * periodicRate)) /
    Math.log(periodicRate + 1)
  );
}
