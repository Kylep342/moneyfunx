// src/index
export {
  MAX_DURATION_YEARS,
  TOTALS,
} from '@/lib/constants';
export { ILoan, Loan } from '@/lib/debt/loan';
export {
  determineExtraPayment,
  amortizePayments,
  payLoans,
} from '@/lib/debt/payments';
export {
  PaymentRecord,
  LoansPaymentSchedule,
  LoanPrincipals,
  PaymentSchedule,
} from '@/lib/debt/paymentTypes';
export {
  calculateMinPayment,
  numPaymentsToZero,
  principalRemaining,
  interestPaid,
} from '@/lib/debt/primitives';
export { NegativeContributionError, PaymentTooLowError } from '@/lib/errors';
export {
  amortizeContributions,
  contributeInstruments,
  determineExtraContribution,
} from '@/lib/investment/contributions';
export {
  ContributionRecord,
  ContributionSchedule,
  InstrumentsContributionSchedule,
} from '@/lib/investment/contributionTypes';
export { IInstrument, Instrument } from '@/lib/investment/instrument';
export {
  balanceRemaining,
  calculateMaxWithdrawal,
  numWithdrawalsToZero,
} from '@/lib/investment/primitives';
export { HasRateAndBalance, snowball, avalanche, sortWith } from '@/lib/shared/sorting';
