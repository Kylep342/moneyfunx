import { describe, expect, it } from 'vitest';
import { divideRound } from '@/lib/shared/primitives';

describe('BigInt primitives', () => {
  describe('divideRound (half-up rounding division)', () => {
    it('should round half-up for exact halves', () => {
      // 5 / 2 = 2.5 -> rounds to 3
      expect(divideRound(5n, 2n)).toBe(3n);
      // 1 / 2 = 0.5 -> rounds to 1
      expect(divideRound(1n, 2n)).toBe(1n);
      // 3 / 2 = 1.5 -> rounds to 2
      expect(divideRound(3n, 2n)).toBe(2n);
    });

    it('should round down if below half', () => {
      // 4 / 3 = 1.333... -> rounds to 1
      expect(divideRound(4n, 3n)).toBe(1n);
      // 1n / 3n = 0.333... -> rounds to 0
      expect(divideRound(1n, 3n)).toBe(0n);
    });

    it('should round up if above or equal to half', () => {
      // 5 / 3 = 1.666... -> rounds to 2
      expect(divideRound(5n, 3n)).toBe(2n);
      // 2 / 3 = 0.666... -> rounds to 1
      expect(divideRound(2n, 3n)).toBe(1n);
    });

    it('should divide perfectly divisible numbers correctly', () => {
      expect(divideRound(6n, 3n)).toBe(2n);
      expect(divideRound(10n, 2n)).toBe(5n);
      expect(divideRound(0n, 5n)).toBe(0n);
    });
  });
});
