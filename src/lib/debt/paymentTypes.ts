export type PaymentRecord = {
  period: number;
  principal: number;
  interest: number;
  principalRemaining: number;
}

export type PaymentSchedule = {
  lifetimeInterest: number;
  lifetimePrincipal: number;
  amortizationSchedule: PaymentRecord[];
}

export type LoansPaymentSchedule = Record<string, PaymentSchedule>;

export type LoanPrincipals = Record<string, number>;
