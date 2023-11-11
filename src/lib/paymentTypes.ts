export interface AmortizationRecord {
  period: number;
  principal: number;
  interest: number;
  principalRemaining: number;
}

export interface PaymentSummary {
  lifetimeInterest: number;
  amortizationSchedule: Array<AmortizationRecord>;
}

export interface LoansPaymentSummary {
  [id: string]: PaymentSummary;
}
