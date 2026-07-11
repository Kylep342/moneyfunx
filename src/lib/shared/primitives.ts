/**
 * This file contains core types and mathematical primitives for pure BigInt calculations.
 */

export type RateSchedule = (period: number, balanceCents: bigint) => bigint;

export type PaymentScheduleInput = bigint | (() => Generator<bigint, void, { period: number; balance: bigint }>);

/**
 * Performs integer division with half-up rounding (traditional financial rounding).
 * 
 * @param {bigint} numerator
 * @param {bigint} denominator
 * @returns {bigint} The rounded quotient
 */
export function divideRound(numerator: bigint, denominator: bigint): bigint {
  const roundingOffset = denominator / 2n;
  return (numerator + roundingOffset) / denominator;
}

/**
 * Generator function that yields a constant payment/contribution amount.
 */
export function* regularPayment(amount: bigint): Generator<bigint, void, { period: number; balance: bigint }> {
  while (true) {
    yield amount;
  }
}

/**
 * Resolves a PaymentScheduleInput into a generator creator function.
 * Ensures that calling the returned function yields a fresh, unexhausted stream.
 */
export function getPaymentStream(
  input: PaymentScheduleInput | null,
  defaultAmount: bigint
): () => Generator<bigint, void, { period: number; balance: bigint }> {
  if (input === null) {
    return () => regularPayment(defaultAmount);
  }
  if (typeof input === 'bigint') {
    return () => regularPayment(input);
  }
  return input;
}
