export interface AmortizationRecord {
  period: number;
  principal: number;
  interest: number;
  principalRemaining: number;
}

export interface PaymentSummary {
  lifetimeInterest: number;
  amortizationSchedule: AmortizationRecord[];
}

export type LoansPaymentSummary = Record<string, PaymentSummary>;

export type LoanPrincipals = Record<string, number>;
