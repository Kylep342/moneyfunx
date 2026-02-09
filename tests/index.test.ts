import { describe, expect, it } from 'vitest';

import * as moneyfunx from '../src/index';

/**
 * Ensures all intended public members are exported from the library.
 * This test acts as a safeguard against accidental omission of core functionality
 * during refactors or version bumps.
 */
describe('moneyfunx module', () => {
  it('exports expected members matching the new descriptive naming standard', async () => {
    const expectedExports: string[] = [
      'constants',
      'contributionTypes',
      'contributions',
      'default',
      'errors',
      'instrument',
      'loan',
      'paymentTypes',
      'payments',
      'primitives',
      'sorting',
      'strategies',
      'withdrawalTypes',
      'withdrawals',
    ].sort();

    expect(Object.keys(moneyfunx).sort()).toStrictEqual(expectedExports);
  });
});
