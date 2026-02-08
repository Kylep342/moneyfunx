/**
 * MoneyFunx
 * * mek it funx up
 */

export {
  MAX_DURATION_YEARS,
  TOTALS,
} from './lib/constants.js';

export { ILoan, Loan } from './lib/debt/loan.js';

export {
  determineExtraPayment,
  amortizePayments,
  payLoans,
} from './lib/debt/payments.js';

export {
  PaymentRecord,
  LoansPaymentSchedule,
  LoanPrincipals,
  PaymentSchedule,
} from './lib/debt/paymentTypes.js';

export { NegativeContributionError, PaymentTooLowError, NegativeWithdrawalError } from './lib/errors.js';

export {
  amortizeContributions,
  contributeInstruments,
  determineExtraContribution,
} from './lib/investment/contributions.js';

export {
  ContributionRecord,
  ContributionSchedule,
  InstrumentsContributionSchedule,
} from './lib/investment/contributionTypes.js';

export { IInstrument, Instrument } from './lib/investment/instrument.js';

export {
  calculateAmortizedWithdrawal,
  drawdownInstruments,
} from './lib/investment/withdrawals.js';

export {
  WithdrawalRecord,
  WithdrawalSchedule,
  InstrumentsWithdrawalSchedule,
} from './lib/investment/withdrawalTypes.js';

export {
  performWaterfallDrawdown,
} from './lib/investment/strategies.js';

export {
  calculatePeriodicAmount,
  calculateBalanceRemaining,
  calculatePeriodsToZero,
  calculateInterestOverPeriods,
} from './lib/shared/primitives.js';

export { HasRateAndBalance, snowball, avalanche, sortWith } from './lib/shared/sorting.js';
