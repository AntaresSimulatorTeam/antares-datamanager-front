import { describe, expect, it } from 'vitest';
import { selectFilteredProjects } from '@/shared/utils/projectUtils.ts';
import { ProjectInfo } from '@/shared/types';

describe('selectFilteredProjects', () => {
  it('retourne les projets non épinglés', () => {
    const state = {
      projects: [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' },
      ] as unknown as ProjectInfo[],
      pinnedProjects: [{ id: 2, name: 'B' }] as unknown as ProjectInfo[],
    };

    const result = selectFilteredProjects(state);

    expect(result).toEqual([
      { id: 1, name: 'A' },
      { id: 3, name: 'C' },
    ]);
  });

  it('retourne tous les projets si pinnedProjects est vide', () => {
    const state = {
      projects: [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ] as unknown as ProjectInfo[],
      pinnedProjects: [] as unknown as ProjectInfo[],
    };

    const result = selectFilteredProjects(state);

    expect(result).toEqual(state.projects);
  });

  it('retourne un tableau vide si projects est vide', () => {
    const state = {
      projects: [] as unknown as ProjectInfo[],
      pinnedProjects: [{ id: 1, name: 'A' }] as unknown as ProjectInfo[],
    };

    const result = selectFilteredProjects(state);

    expect(result).toEqual([]);
  });

  it('retourne un tableau vide si tous les projets sont épinglés', () => {
    const state = {
      projects: [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ] as unknown as ProjectInfo[],
      pinnedProjects: [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ] as unknown as ProjectInfo[],
    };

    const result = selectFilteredProjects(state);

    expect(result).toEqual([]);
  });

  it('ignore les pinnedProjects qui ne sont pas dans projects', () => {
    const state = {
      projects: [{ id: 1, name: 'A' }] as unknown as ProjectInfo[],
      pinnedProjects: [{ id: 999, name: 'Ghost' }] as unknown as ProjectInfo[],
    };

    const result = selectFilteredProjects(state);

    expect(result).toEqual([{ id: 1, name: 'A' }]);
  });

  it('gère les doublons dans pinnedProjects', () => {
    const state = {
      projects: [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ] as unknown as ProjectInfo[],
      pinnedProjects: [
        { id: 2, name: 'B' },
        { id: 2, name: 'B' }, // doublon
      ] as unknown as ProjectInfo[],
    };

    const result = selectFilteredProjects(state);

    expect(result).toEqual([{ id: 1, name: 'A' }]);
  });

  it("ne modifie pas l'ordre des projets", () => {
    const state = {
      projects: [
        { id: 3, name: 'C' },
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ] as unknown as ProjectInfo[],
      pinnedProjects: [{ id: 2, name: 'B' }] as unknown as ProjectInfo[],
    };

    const result = selectFilteredProjects(state);

    expect(result).toEqual([
      { id: 3, name: 'C' },
      { id: 1, name: 'A' },
    ]);
  });

  it('compare uniquement les id (pas les autres propriétés)', () => {
    const state = {
      projects: [{ id: 1, name: 'A' }] as unknown as ProjectInfo[],
      pinnedProjects: [{ id: 1, name: 'DIFFÉRENT' }] as unknown as ProjectInfo[],
    };

    const result = selectFilteredProjects(state);

    expect(result).toEqual([]); // même id → filtré
  });
});
