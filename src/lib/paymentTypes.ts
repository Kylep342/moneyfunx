export type AmortizationRecord = {
  period: number;
  principal: number;
  interest: number;
  principalRemaining: number;
}

export type PaymentSchedule = {
  lifetimeInterest: number;
  lifetimePrincipal: number;
  amortizationSchedule: AmortizationRecord[];
}

export type LoansPaymentSchedule = Record<string, PaymentSchedule>;

export type LoanPrincipals = Record<string, number>;
