import { describe, expect, it } from 'vitest';
import { addPinnedProject, addProject, removeProject, unpinPinnedProject } from '@/store/reducers/projectReducer.tsx';
import { mockProjectInfo, mockProjectInfoArray } from '@/mocks/data/tests/project.mock.ts';
import { mockPinProjectResponseArray } from '@/mocks/data/tests/pinnedProject.mock.ts';

const initialState = {
  projects: mockProjectInfoArray,
  pinnedProjects: mockPinProjectResponseArray,
};

describe('addProject', () => {
  it('should add a new project to the beginning of the projects list', () => {

    const result = addProject(initialState, mockProjectInfo);

    expect(result.projects).toEqual([
      mockProjectInfo,
      initialState.projects[0],
      initialState.projects[1],
    ]);

    expect(result.pinnedProjects).toEqual(initialState.pinnedProjects);
  });

  it('should handle adding to an empty project list', () => {
    const emptyState = {
      projects: [],
      pinnedProjects: [],
    };

    const result = addProject(emptyState, mockProjectInfo);

    expect(result.projects).toEqual([mockProjectInfo]);
    expect(result.pinnedProjects).toEqual([]);
  });
});

describe('removeProject', () => {

  it('should remove project from both lists if present', () => {
    const result = removeProject(initialState, '123');

    expect(result.projects).toEqual([{
      id: '125',
      name: 'Bilan prévisionnel 2019',
      description: 'Project Description',
      createdBy: 'User B',
      creationDate: '2013-08-01' as unknown as Date,
      tags: ['tag3', 'tag4'],
      path: '',
      studies: [],
      archived: false,
      pinned: false
    }]);
    expect(result.pinnedProjects).toEqual([{
      id: '124',
      name: 'Project Name 3',
      description: 'Project Description',
      createdBy: 'User A',
      creationDate: '2024-07-25T10:09:41' as unknown as Date,
      tags: ['tag1', 'tag2'],
      archived: true,
      pinned: true,
      path: '',
      studies: [1, 2],
    }]);
  });

  it('should not change lists if project id is not found', () => {
    const result = removeProject(initialState, 'proj-999');

    expect(result.projects).toEqual(initialState.projects);
    expect(result.pinnedProjects).toEqual(initialState.pinnedProjects);
  });

  it('should handle empty lists gracefully', () => {
    const emptyState = {
      projects: [],
      pinnedProjects: [],
    };

    const result = removeProject(emptyState, 'proj-001');

    expect(result.projects).toEqual([]);
    expect(result.pinnedProjects).toEqual([]);
  });
});

describe('addPinnedProject', () => {
  it('should add payload to pinnedProjects with pinned set', () => {
    const initialStateAddPinned = {
      projects: mockProjectInfoArray,
      pinnedProjects: [],
    };

    const result = addPinnedProject(initialStateAddPinned, mockProjectInfo);

    expect(result.pinnedProjects).toHaveLength(1);
    expect(result.pinnedProjects[0]).toMatchObject({...mockProjectInfo, pinned: true});

    expect(result.projects).toEqual(initialState.projects);
  });

  it('should preserve existing pinnedProjects', () => {
    const initialStateAddPinned = {
      projects: [],
      pinnedProjects: mockPinProjectResponseArray,
    };

    const result = addPinnedProject(initialStateAddPinned, mockProjectInfoArray[0]);

    expect(result.pinnedProjects).toEqual([
      initialState.pinnedProjects[0],
      initialState.pinnedProjects[1],
      {
        ...mockProjectInfoArray[0],
        pinned: true
      },
    ]);
  });
});

describe('unpinPinnedProject', () => {
  it('should remove the project from pinnedProjects by id', () => {
    const result = unpinPinnedProject(initialState, '124');

    expect(result.pinnedProjects).toEqual([mockPinProjectResponseArray[0]]);
    expect(result.projects).toEqual(initialState.projects);
  });

  it('should leave pinnedProjects unchanged if id not found', () => {
    const result = unpinPinnedProject(initialState, 'proj-123');

    expect(result.pinnedProjects).toEqual(initialState.pinnedProjects);
    expect(result.projects).toEqual(initialState.projects);
  });

  it('should handle empty pinnedProjects gracefully', () => {
    const result = unpinPinnedProject({ projects: [], pinnedProjects: [] }, 'proj-001');

    expect(result.pinnedProjects).toEqual([]);
    expect(result.projects).toEqual([]);
  });
});

