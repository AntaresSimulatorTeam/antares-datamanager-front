import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import {
  getAlignment,
  getDefaultAreaNotIncludedInAreaList,
  hasLabelDefault,
  simulateProgress,
  transformToSubRowKeys,
} from '@/shared/utils/hypothesisTableUtils.ts';
import { HypothesisRowData, TrajectoryAreaData } from '@/shared/types';
import { Row } from '@tanstack/react-table';
import { isTechnology } from '@/shared/utils/trajectoryUtils.ts';
import { OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';

describe('getAlignment', () => {
  it('should return "pl-0" when depth is 0 and row can expand', () => {
    const row = {
      depth: 0,
      getCanExpand: () => true,
    } as unknown as Row<HypothesisRowData>;

    expect(getAlignment(row)).toBe('pl-0');
  });

  it('should return "pl-1" when depth is 0 and row cannot expand', () => {
    const row = {
      depth: 0,
      getCanExpand: () => false,
    } as unknown as Row<HypothesisRowData>;

    expect(getAlignment(row)).toBe('pl-1');
  });

  it('should return "pl-4" when depth is greater than 0', () => {
    const row = {
      depth: 1,
      getCanExpand: () => true, // irrelevant in this case
    } as unknown as Row<HypothesisRowData>;

    expect(getAlignment(row)).toBe('pl-4');
  });
});

vi.mock('@/shared/utils/trajectoryUtils', () => ({
  isTechnology: vi.fn(),
}));

describe('hasLabelDefault', () => {
  it('returns true for depth 1, isDefault true, not technology, not OTHER_AREAS_LABEL', () => {
    (isTechnology as Mock).mockReturnValue(false);
    expect(hasLabelDefault(1, true, 'AI')).toBe(true);
  });

  it('returns false for depth 1 if hypothesis is technology', () => {
    (isTechnology as Mock).mockReturnValue(true);
    expect(hasLabelDefault(1, true, 'Tech')).toBe(false);
  });

  it('returns false for depth 1 if hypothesis is OTHER_AREAS_LABEL', () => {
    (isTechnology as Mock).mockReturnValue(false);
    expect(hasLabelDefault(1, true, OTHER_AREAS_LABEL)).toBe(false);
  });

  it('returns true for depth 0, isDefault true, not OTHER_AREAS_LABEL', () => {
    expect(hasLabelDefault(0, true, 'AI')).toBe(true);
  });

  it('returns false for depth 0 if isDefault is false', () => {
    expect(hasLabelDefault(0, false, 'AI')).toBe(false);
  });

  it('returns false for depth 0 if hypothesis is OTHER_AREAS_LABEL', () => {
    expect(hasLabelDefault(0, true, OTHER_AREAS_LABEL)).toBe(false);
  });

  it('returns false for other depths', () => {
    expect(hasLabelDefault(2, true, 'AI')).toBe(false);
  });
});

describe('getDefaultAreaNotIncludedInAreaList', () => {
  it('retourne toutes les zones par défaut si areas est undefined', () => {
    const defaultAreas = [{ name: 'Zone A' }, { name: 'Zone B' }];
    const result = getDefaultAreaNotIncludedInAreaList(defaultAreas, undefined);
    expect(result).toEqual(['Zone A', 'Zone B']);
  });

  it('retourne les zones par défaut non présentes dans areas', () => {
    const defaultAreas = [{ name: 'Zone A' }, { name: 'Zone B' }, { name: 'Zone C' }];
    const areas: TrajectoryAreaData[] = [
      {
        areaName: 'Zone B',
        powerToGas: null,
        shortTermStorage: null,
      },
    ];
    const result = getDefaultAreaNotIncludedInAreaList(defaultAreas, areas);
    expect(result).toEqual(['Zone A', 'Zone C']);
  });

  it('retourne un tableau vide si toutes les zones sont présentes', () => {
    const defaultAreas = [{ name: 'Zone A' }, { name: 'Zone B' }];
    const areas: TrajectoryAreaData[] = [
      {
        areaName: 'Zone A',
        powerToGas: null,
        shortTermStorage: null,
      },
      {
        areaName: 'Zone B',
        powerToGas: null,
        shortTermStorage: null,
      },
    ];
    const result = getDefaultAreaNotIncludedInAreaList(defaultAreas, areas);
    expect(result).toEqual([]);
  });

  it('retourne un tableau vide si defaultAreas est vide', () => {
    const defaultAreas: { name: string }[] = [];
    const areas: TrajectoryAreaData[] = [
      {
        areaName: 'Zone A',
        powerToGas: null,
        shortTermStorage: null,
      },
    ];
    const result = getDefaultAreaNotIncludedInAreaList(defaultAreas, areas);
    expect(result).toEqual([]);
  });

  it('gère les noms similaires mais différents', () => {
    const defaultAreas = [{ name: 'Zone A' }, { name: 'Zone-A' }];
    const areas: TrajectoryAreaData[] = [
      {
        areaName: 'Zone A',
        powerToGas: null,
        shortTermStorage: null,
      },
    ];
    const result = getDefaultAreaNotIncludedInAreaList(defaultAreas, areas);
    expect(result).toEqual(['Zone-A']);
  });
});

describe('transformToSubRowKeys', () => {
  it('transforme une seule clé', () => {
    const input = { 0: true };
    const expected = { '0.0': true };
    expect(transformToSubRowKeys(input)).toEqual(expected);
  });

  it('transforme plusieurs clés', () => {
    const input = { 0: true, 1: false, 2: true };
    const expected = { '0.0': true, '0.1': false, '0.2': true };
    expect(transformToSubRowKeys(input)).toEqual(expected);
  });

  it('gère un objet vide', () => {
    const input = {};
    const expected = {};
    expect(transformToSubRowKeys(input)).toEqual(expected);
  });

  it('gère des clés numériques comme chaînes', () => {
    const input = { '1': false };
    const expected = { '0.1': false };
    expect(transformToSubRowKeys(input)).toEqual(expected);
  });
});

let rafCallbacks: FrameRequestCallback[] = [];

global.requestAnimationFrame = (cb: FrameRequestCallback): number => {
  rafCallbacks.push(cb);
  return rafCallbacks.length - 1;
};

global.cancelAnimationFrame = vi.fn();

describe('simulateProgress', () => {
  let onProgress: (value: number) => void;

  beforeEach(() => {
    rafCallbacks = [];
    onProgress = vi.fn();
  });

  it('should call onProgress with increasing values and end at 100%', async () => {
    const promise = simulateProgress(1000, onProgress);
    let timestamp = 0;
    while (rafCallbacks.length > 0) {
      const cb = rafCallbacks.shift()!;
      timestamp += 250;
      cb(timestamp);
    }

    await promise;

    const calls = (onProgress as Mock).mock.calls.map((call: number[]) => call[0]);
    expect(calls[calls.length - 1]).toBe(100);
    expect(calls.length).toBeGreaterThan(1);
  });
});
