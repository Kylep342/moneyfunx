export type AmortizationRecord = {
  period: number;
  principal: number;
  interest: number;
  principalRemaining: number;
}

export type PaymentSummary = {
  lifetimeInterest: number;
  lifetimePrincipal: number;
  amortizationSchedule: AmortizationRecord[];
}

export type LoansPaymentSummary = Record<string, PaymentSummary>;

export type LoanPrincipals = Record<string, number>;
