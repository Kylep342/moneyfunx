/**
 * MoneyFunx
 * * mek it funx up
 */

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

export { NegativeContributionError, PaymentTooLowError, NegativeWithdrawalError } from '@/lib/errors';

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
  calculateAmortizedWithdrawal,
  drawdownInstruments,
} from '@/lib/investment/withdrawals';

export {
  WithdrawalRecord,
  WithdrawalSchedule,
  InstrumentsWithdrawalSchedule,
} from '@/lib/investment/withdrawalTypes';

// export {
//   performWaterfallDrawdown,
// } from '@/lib/investment/strategies';

export {
  calculatePeriodicAmount,
  calculateBalanceRemaining,
  calculatePeriodsToZero,
  calculateInterestOverPeriods,
} from '@/lib/shared/primitives';

export { HasRateAndBalance, snowball, avalanche, sortWith } from '@/lib/shared/sorting';
