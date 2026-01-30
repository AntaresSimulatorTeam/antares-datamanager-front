import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import {
  buildAreaOptions,
  buildCheckListBox,
  buildCheckValuesList,
  getAlignment,
  getDefaultAreaNotIncludedInAreaList,
  getSchemeData,
  hasLabelDefault,
  simulateProgress,
  transformToSubRowKeys,
} from '@/shared/utils/hypothesisTableUtils.ts';
import {
  DbTrajectory,
  HypothesisRowData,
  TrajectoryAreaData,
  TrajectoryAreaDataScheme,
  TrajectoryLinkDataScheme,
  TrajectorySTSDataScheme,
} from '@/shared/types';
import { Row } from '@tanstack/react-table';
import { OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

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
    expect(hasLabelDefault(1, true, 'AI', false)).toBe(true);
  });

  it('returns false for depth 1 if hypothesis is technology', () => {
    expect(hasLabelDefault(1, true, 'Tech', true)).toBe(false);
  });

  it('returns false for depth 1 if hypothesis is OTHER_AREAS_LABEL', () => {
    expect(hasLabelDefault(1, true, OTHER_AREAS_LABEL, false)).toBe(false);
  });

  it('returns true for depth 0, isDefault true, not OTHER_AREAS_LABEL', () => {
    expect(hasLabelDefault(0, true, 'AI', true)).toBe(true);
  });

  it('returns false for depth 0 if isDefault is false', () => {
    expect(hasLabelDefault(0, false, 'AI', false)).toBe(false);
  });

  it('returns false for depth 0 if hypothesis is OTHER_AREAS_LABEL', () => {
    expect(hasLabelDefault(0, true, OTHER_AREAS_LABEL, true)).toBe(false);
  });

  it('returns false for other depths', () => {
    expect(hasLabelDefault(2, true, 'AI', false)).toBe(false);
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
        spilledEnergyCost: null,
        unsuppliedEnergyCost: null,
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
        spilledEnergyCost: null,
        unsuppliedEnergyCost: null,
      },
      {
        areaName: 'Zone B',
        spilledEnergyCost: null,
        unsuppliedEnergyCost: null,
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
        spilledEnergyCost: null,
        unsuppliedEnergyCost: null,
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
        spilledEnergyCost: null,
        unsuppliedEnergyCost: null,
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

describe('buildCheckListBox', () => {
  it('should return correct areaOptions and checkedValues with all inputs', () => {
    const areaWithTrajectory = [{ area: 'Zone A' }, { area: 'Zone B' }] as DbTrajectory[];

    const areas = [{ areaName: 'Zone A' }, { areaName: 'Zone C' }] as TrajectoryAreaData[];

    const defaultAreas = [{ name: 'Zone D' }];

    const result = buildCheckListBox(areaWithTrajectory, areas, defaultAreas);

    expect(result.areaOptions).toEqual([
      { name: 'Zone D', isDefault: true },
      { name: 'Zone A', isDefault: false },
      { name: 'Zone C', isDefault: false },
    ]);

    expect(result.checkedValues).toEqual(['Zone D', 'Zone A', 'Zone B']);
  });

  it('should handle empty areas and defaultAreas', () => {
    const areaWithTrajectory = [{ area: 'Zone X' }] as DbTrajectory[];

    const result = buildCheckListBox(areaWithTrajectory, [], []);

    expect(result.areaOptions).toEqual([]);
    expect(result.checkedValues).toEqual(['Zone X']);
  });

  it('should exclude defaultAreas from areaOptions and checkedValues', () => {
    const areaWithTrajectory: DbTrajectory[] = [{ area: 'Zone D' }] as DbTrajectory[];
    const areas: TrajectoryAreaData[] = [{ areaName: 'Zone D' }] as TrajectoryAreaData[];
    const defaultAreas = [{ name: 'Zone D' }];

    const result = buildCheckListBox(areaWithTrajectory, areas, defaultAreas);

    expect(result.areaOptions).toEqual([{ name: 'Zone D', isDefault: true }]);
    expect(result.checkedValues).toEqual(['Zone D']);
  });

  it('should return empty arrays when all inputs are empty', () => {
    const result = buildCheckListBox([], [], []);

    expect(result.areaOptions).toEqual([]);
    expect(result.checkedValues).toEqual([]);
  });
});

describe('buildAreaOptions', () => {
  it('should return combined areas with correct isDefault flags', () => {
    const trajectoryAreas = [
      { areaName: 'Zone A' },
      { areaName: 'Zone B' },
      { areaName: 'Zone C' },
    ] as TrajectoryAreaData[];
    const defaultAreas = [{ name: 'Zone A' }, { name: 'Zone D' }];

    const result = buildAreaOptions(trajectoryAreas, defaultAreas);

    expect(result).toEqual([
      { name: 'Zone A', isDefault: true },
      { name: 'Zone D', isDefault: true },
      { name: 'Zone B', isDefault: false },
      { name: 'Zone C', isDefault: false },
    ]);
  });

  it('should treat all trajectory areas as non-default if no defaultAreas provided', () => {
    const trajectoryAreas = [{ areaName: 'Zone X' }, { areaName: 'Zone Y' }] as TrajectoryAreaData[];

    const result = buildAreaOptions(trajectoryAreas);

    expect(result).toEqual([
      { name: 'Zone X', isDefault: false },
      { name: 'Zone Y', isDefault: false },
    ]);
  });

  it('should return only default areas if trajectoryAreas is empty', () => {
    const defaultAreas = [{ name: 'Zone D' }];

    const result = buildAreaOptions([], defaultAreas);

    expect(result).toEqual([{ name: 'Zone D', isDefault: true }]);
  });

  it('should return empty array if both inputs are empty', () => {
    const result = buildAreaOptions([], []);

    expect(result).toEqual([]);
  });
});

describe('buildCheckValuesList', () => {
  it('should combine default areas and non-overlapping trajectory areas', () => {
    const areaWithTrajectory = [{ area: 'Zone A' }, { area: 'Zone B' }, { area: 'Zone C' }] as DbTrajectory[];
    const defaultAreas = [{ name: 'Zone A' }, { name: 'Zone D' }];

    const result = buildCheckValuesList(areaWithTrajectory, defaultAreas);

    expect(result).toEqual(['Zone A', 'Zone D', 'Zone B', 'Zone C']);
  });

  it('should return only trajectory areas if no defaultAreas provided', () => {
    const areaWithTrajectory = [{ area: 'Zone X' }, { area: 'Zone Y' }] as DbTrajectory[];

    const result = buildCheckValuesList(areaWithTrajectory);

    expect(result).toEqual(['Zone X', 'Zone Y']);
  });

  it('should return only default areas if trajectory list is empty', () => {
    const defaultAreas = [{ name: 'Zone D' }];

    const result = buildCheckValuesList([], defaultAreas);

    expect(result).toEqual(['Zone D']);
  });

  it('should return empty array if both inputs are empty', () => {
    const result = buildCheckValuesList([], []);

    expect(result).toEqual([]);
  });

  it('should skip trajectory areas that are also in defaultAreas', () => {
    const areaWithTrajectory = [{ area: 'Zone A' }, { area: 'Zone B' }] as DbTrajectory[];
    const defaultAreas = [{ name: 'Zone A' }];

    const result = buildCheckValuesList(areaWithTrajectory, defaultAreas);

    expect(result).toEqual(['Zone A', 'Zone B']);
  });
});

describe('getSchemeData', () => {
  it('return area scheme for AREA type', () => {
    expect(getSchemeData(TRAJECTORY_TYPE.AREA)).toBe(TrajectoryAreaDataScheme);
  });

  it('return area scheme for LINK type', () => {
    expect(getSchemeData(TRAJECTORY_TYPE.LINK)).toBe(TrajectoryLinkDataScheme);
  });

  it('return area scheme for STS type', () => {
    expect(getSchemeData(TRAJECTORY_TYPE.STS)).toBe(TrajectorySTSDataScheme);
  });
});
