import { describe, expect, it } from 'vitest';
import { hasArrayChanged } from '@/shared/utils/arrayUtils.ts';

describe('hasArrayChanged', () => {
  it('returns false when arrays are identical', () => {
    expect(hasArrayChanged(['a', 'b'], ['a', 'b'])).toBe(false);
  });

  it('returns true when arrays have different lengths', () => {
    expect(hasArrayChanged(['a', 'b'], ['a'])).toBe(true);
  });

  it('returns true when arrays have same length but different elements', () => {
    expect(hasArrayChanged(['a', 'b'], ['a', 'c'])).toBe(true);
  });

  it('returns true when order of elements is different', () => {
    expect(hasArrayChanged(['a', 'b'], ['b', 'a'])).toBe(true);
  });

  it('returns false for two empty arrays', () => {
    expect(hasArrayChanged([], [])).toBe(false);
  });
});
