import { describe, expect, it } from 'vitest';
import { getDefaultAreaNotIncludedInAreaList, transformToSubRowKeys } from '@/shared/utils/hypothesisTableUtils.ts';
import { TrajectoryAreaData } from '@/shared/types';

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
