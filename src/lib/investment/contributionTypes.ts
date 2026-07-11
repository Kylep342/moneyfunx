export type ContributionRecord = {
  period: number;
  contribution: bigint;
  growth: bigint;
  currentBalance: bigint;
};

export type ContributionSchedule = {
  lifetimeGrowth: bigint;
  lifetimeContribution: bigint;
  amortizationSchedule: ContributionRecord[];
};

export type InstrumentsContributionSchedule = Record<string, ContributionSchedule>;

export type InstrumentBalances = Record<string, bigint>;

export type InstrumentYTDs = Record<string, bigint>;
