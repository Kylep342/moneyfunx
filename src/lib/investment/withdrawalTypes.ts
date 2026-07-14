export type WithdrawalRecord = {
  period: number;
  withdrawal: bigint;
  netAmount: bigint;
  growth: bigint;
  currentBalance: bigint;
};

export type WithdrawalSchedule = {
  lifetimeGrowth: bigint;
  lifetimeWithdrawal: bigint;
  amortizationSchedule: WithdrawalRecord[];
};

export type InstrumentsWithdrawalSchedule = Record<string, WithdrawalSchedule> & {
  totals: WithdrawalSchedule;
};

export type InstrumentBalances = Record<string, bigint>;
