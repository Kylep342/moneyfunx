// src/index.js
import { PaymentTooLowError } from './lib/errors.js';
import {
  calculateMinPayment,
  numPaymentsToZero,
  principalRemaining,
  interestPaid,
} from './lib/helperFunctions.js';
import { Loan } from './lib/loan.js';
import {
  determineExtraPayment,
  amortizePayments,
  payLoans,
} from './lib/payments.js';
import { snowball, avalanche, sortLoans } from './lib/sorting.js';
import { TOTALS } from './lib/constants.js';

export const moneyfunx = {
  amortizePayments,
  avalanche,
  calculateMinPayment,
  determineExtraPayment,
  interestPaid,
  Loan,
  numPaymentsToZero,
  payLoans,
  PaymentTooLowError,
  principalRemaining,
  snowball,
  sortLoans,
  TOTALS,
};

export default moneyfunx;
