import { describe, expect, it } from 'vitest';

import * as loan from '../src/lib/loan.ts';
import * as sorting from '../src/lib/sorting.ts';

describe('sorting module', () => {
  const loan1 = new loan.Loan(7500, 0.0368, 12, 10);
  const loan2 = new loan.Loan(7500, 0.068, 12, 10);
  const loan3 = new loan.Loan(4500, 0.0429, 12, 10);

  const loans = [loan2, loan3, loan1];

  it('avalanche compares loans correctly', async () => {
    expect(sorting.avalanche(loan2, loan1)).toBe(-0.031200000000000006);
    expect(sorting.avalanche(loan3, loan1)).toBe(-0.006100000000000001);
  });

  it('snowball compares loans correctly', async () => {
    expect(sorting.snowball(loan2, loan3)).toBe(3000);
    expect(sorting.snowball(loan2, loan1)).toBe(0);
  });

  it('orders loans correctly using avalanche sorting', async () => {
    expect(sorting.sortLoans(loans, sorting.avalanche)).toStrictEqual([
      loan2,
      loan3,
      loan1,
    ]);
  });

  it('orders loans correctly using snowball sorting', async () => {
    expect(sorting.sortLoans(loans, sorting.snowball)).toStrictEqual([
      loan3,
      loan2,
      loan1,
    ]);
  });
});
