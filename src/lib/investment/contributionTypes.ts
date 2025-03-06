/**
 *
 * concept of "maximum contribution" (maxContribution)
 * analogous to a "minimum payment" (minPayment) for a Loan
 *
 *
 *
 * current UI is
 * table
 *  row-> year
 *  column -> totalAnnualContribution
 *  cell -> Wealth
 *
 *
 * Want to produce similar to payments.ts:
 *  determineExtraPayment [carryover after all MAX contributions are fulfilled]
 *  amortizeContributions ** investigate if possible **
 *  contributeInvestments [main a la payLoans]
 */

export type AmortizationRecord = {
  period: number;
  contribution: number;
  growth: number;
  currentBalance: number;
}

export type ContributionSchedule = {
  lifetimeGrowth: number;
  lifetimeContribution: number;
  amortizationSchedule: AmortizationRecord[];
}

export type InstrumentsContributionSchedule = Record<string, ContributionSchedule>

export type InstrumentBalances = Record<string, number>
