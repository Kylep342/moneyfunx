export type PaymentRecord = {
  period: number;
  principal: bigint;
  interest: bigint;
  principalRemaining: bigint;
}

export type PaymentSchedule = {
  lifetimeInterest: bigint;
  lifetimePrincipal: bigint;
  amortizationSchedule: PaymentRecord[];
}

export type LoansPaymentSchedule = Record<string, PaymentSchedule>;

export type LoanPrincipals = Record<string, bigint>;
