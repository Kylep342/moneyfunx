export type WithdrawalRecord = {
  period: number;
  withdrawal: number;
  netAmount: number;
  growth: number;
  currentBalance: number;
};

export type WithdrawalSchedule = {
  lifetimeGrowth: number;
  lifetimeWithdrawal: number;
  amortizationSchedule: WithdrawalRecord[];
};

export type InstrumentsWithdrawalSchedule = Record<string, WithdrawalSchedule> & {
  totals: WithdrawalSchedule;
};

export type InstrumentBalances = Record<string, number>;
