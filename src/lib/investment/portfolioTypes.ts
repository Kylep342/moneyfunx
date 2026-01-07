import { IInstrument } from '@/lib/investment/instrument';

export interface IPortfolio {
    id: string;
    name: string;
    instruments: IInstrument[];
};

export interface IStrategy {
    id: string;
    name: string;
    netIncome: number;
    taxRate: number;
};

export type WithdrawalRecord = {
    period: number;
    withdrawal: number;
    growth: number;
    currentBalance: number;
};

export type WithdrawalSchedule = {
    lifetimeGrowth: number;
    lifetimeWithdrawal: number;
    withdrawalSchedule: WithdrawalRecord[];
};

export type InstrumentsWithdrawalSchedule = Record<string, WithdrawalSchedule>;
