/**
 * Moneyfunx
 * A library for financial calculations regarding debt and investments.
 */

import * as constants from './lib/constants.js';
import * as loan from './lib/debt/loan.js';
import * as payments from './lib/debt/payments.js';
import * as paymentTypes from './lib/debt/paymentTypes.js';
import * as errors from './lib/errors.js';
import * as contributions from './lib/investment/contributions.js';
import * as contributionTypes from './lib/investment/contributionTypes.js';
import * as instrument from './lib/investment/instrument.js';
import * as withdrawals from './lib/investment/withdrawals.js';
import * as withdrawalTypes from './lib/investment/withdrawalTypes.js';
import * as strategies from './lib/investment/strategies.js';
import * as primitives from './lib/shared/primitives.js';
import * as sorting from './lib/shared/sorting.js';

// Named exports for granular access
export {
  constants,
  loan,
  payments,
  paymentTypes,
  errors,
  contributions,
  contributionTypes,
  instrument,
  withdrawals,
  withdrawalTypes,
  strategies,
  primitives,
  sorting,
};

/**
 * Consolidated namespace for unambiguous access.
 * @example
 * import moneyfunx from 'moneyfunx';
 * moneyfunx.loan.calculateMonthlyPayment(...);
 */
const moneyfunx = {
  ...constants,
  ...loan,
  ...payments,
  ...paymentTypes,
  ...errors,
  ...contributions,
  ...contributionTypes,
  ...instrument,
  ...withdrawals,
  ...withdrawalTypes,
  ...strategies,
  ...primitives,
  ...sorting,
};

export default moneyfunx;
