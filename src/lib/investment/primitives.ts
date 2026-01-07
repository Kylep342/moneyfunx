
/**
 * Calculates the maximum withdrawal
 *  for the balance in the number of periods at the periodic rate
 *
 * @param {number} balance The amount saved
 * @param {number} periodicRate The rate the balance accrues interest at per period
 * @param {number [int]} periods The number of periods the balance is drawn down over
 * @returns {number} The maximum withdrawal
 */
export function calculateMaxWithdrawal(
  balance: number,
  periodicRate: number,
  periods: number
): number {
  return periodicRate > 0
    ? balance *
    ((periodicRate * (1 + periodicRate) ** periods) /
      ((1 + periodicRate) ** periods - 1))
    : balance / periods;
}

/**
 * Calculates the balance remaining after a certain number of withdrawals from a beginning balance at a periodic rate
 *
 * @param {number} balance The amount saved
 * @param {number} withdrawal The amount withdrawn at each period
 * @param {number} periodicRate The rate the balance accrues interest at per period
 * @param {number [int]} periods The number of periods paid to compute the desired balance remaining
 * @returns {number} The remaining balance
 */
export function balanceRemaining(
  balance: number,
  withdrawal: number,
  periodicRate: number,
  periods: number
): number {
  return Math.max(
    (balance * (1 + periodicRate) ** periods) -
    (withdrawal * ((1 + periodicRate) ** periods - 1) / periodicRate),
    0
  );
}

/**
 * Calculates the number of withdrawals required to pay off a balance
 *
 * @param {number} balance The amount borrowed
 * @param {number} withdrawal The amount paid at each period
 * @param {number} periodicRate The rate the princpal accrues interest at per period
 * @returns {number} The number of withdrawals needed to pay off the balance
 */
export function numWithdrawalsToZero(
  balance: number,
  withdrawal: number,
  periodicRate: number
): number {
  return Math.ceil(
    Math.log(withdrawal / (withdrawal - balance * periodicRate)) /
    Math.log(periodicRate + 1)
  );
}
