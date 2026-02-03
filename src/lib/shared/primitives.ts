/**
 * Shared primitives for financial calculations including Loans, Investments, and Drawdowns.
 */

/**
 * Calculates the periodic amount (e.g., payment, contribution, or withdrawal)
 * required to reach zero over a set number of periods.
 *
 * @param {number} startingBalance - The initial amount of money.
 * @param {number} periodicInterestRate - The interest rate applied per period.
 * @param {number} totalNumberOfPeriods - The duration of the calculation in periods.
 * @returns {number} The calculated periodic amount.
 */
export function calculatePeriodicAmount(
  startingBalance: number,
  periodicInterestRate: number,
  totalNumberOfPeriods: number
): number {
  return periodicInterestRate > 0
    ? startingBalance *
        ((periodicInterestRate * (1 + periodicInterestRate) ** totalNumberOfPeriods) /
          ((1 + periodicInterestRate) ** totalNumberOfPeriods - 1))
    : startingBalance / totalNumberOfPeriods;
}

/**
 * Calculates the balance remaining after a specific number of periods have elapsed.
 *
 * @param {number} initialBalance - The starting amount of money.
 * @param {number} periodicAmountApplied - The amount paid/withdrawn each period.
 * @param {number} periodicInterestRate - The interest rate applied per period.
 * @param {number} periodsElapsed - The number of periods to calculate for.
 * @returns {number} The remaining balance at the end of the elapsed periods.
 */
export function calculateBalanceRemaining(
  initialBalance: number,
  periodicAmountApplied: number,
  periodicInterestRate: number,
  periodsElapsed: number
): number {
  if (periodicInterestRate === 0) {
    return Math.max(initialBalance - (periodicAmountApplied * periodsElapsed), 0);
  }

  // This matches your original principalRemaining logic
  return Math.max(
    (initialBalance * (1 + periodicInterestRate) ** periodsElapsed) -
    (periodicAmountApplied * ((1 + periodicInterestRate) ** periodsElapsed - 1) / periodicInterestRate),
    0
  );
}

/**
 * Calculates the number of periods required to bring a balance to zero.
 *
 * @param {number} currentBalance - The balance to be paid down or drawn down.
 * @param {number} periodicAmountApplied - The amount paid/withdrawn each period.
 * @param {number} periodicInterestRate - The interest rate applied per period.
 * @returns {number} The number of periods (rounded up) to reach zero.
 */
export function calculatePeriodsToZero(
  currentBalance: number,
  periodicAmountApplied: number,
  periodicInterestRate: number
): number {
  return Math.ceil(
    Math.log(periodicAmountApplied / (periodicAmountApplied - currentBalance * periodicInterestRate)) /
    Math.log(periodicInterestRate + 1)
  );
}

/**
 * Calculates the total interest accrued or paid over a specific number of periods.
 *
 * @param {number} initialBalance - The starting amount of money.
 * @param {number} periodicAmountApplied - The amount paid/withdrawn each period.
 * @param {number} periodicInterestRate - The interest rate applied per period.
 * @param {number} periodsElapsed - The number of periods to calculate for.
 * @returns {number} The total interest amount.
 */
export function calculateInterestOverPeriods(
  initialBalance: number,
  periodicAmountApplied: number,
  periodicInterestRate: number,
  periodsElapsed: number
): number {
  const finalBalanceRemaining: number = calculateBalanceRemaining(
    initialBalance,
    periodicAmountApplied,
    periodicInterestRate,
    periodsElapsed
  );

  const totalPrincipalReduction: number = initialBalance - finalBalanceRemaining;
  const totalAmountPaid: number = periodicAmountApplied * periodsElapsed;

  return totalAmountPaid - totalPrincipalReduction;
}
