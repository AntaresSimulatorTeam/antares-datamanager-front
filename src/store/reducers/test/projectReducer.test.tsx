import { describe, expect, it } from 'vitest';
import {
  addPinnedProject,
  addProject,
  projectReducer,
  removeProject,
  unpinPinnedProject,
  updateProject,
} from '@/store/reducers/projectReducer.tsx';
import { mockProjectInfo, mockProjectInfoArray } from '@/mocks/data/tests/project.mock.ts';
import { mockPinProjectResponseArray } from '@/mocks/data/tests/pinnedProject.mock.ts';
import { PROJECT_ACTION } from '@/shared/enum/project.ts';
import { ProjectActionType, ProjectInfo, ProjectState } from '@/shared/types';

const initialState = {
  projects: mockProjectInfoArray,
  pinnedProjects: mockPinProjectResponseArray,
} as ProjectState;

describe('addProject', () => {
  it('should add a new project to the beginning of the projects list', () => {
    const result = addProject(initialState, mockProjectInfo);

    expect(result.projects).toEqual([mockProjectInfo, initialState.projects[0], initialState.projects[1]]);

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

describe('updateProject', () => {
  it('should update a project and the corresponding pinned project of the projects list', () => {
    const payload = {
      ...mockProjectInfo,
      name: 'Updated Project',
      description: 'Project Description 2',
      tags: ['tag3'],
    };
    const result = updateProject(initialState, payload);
    const projectUpdated = result.projects.find((project) => project.id === payload.id);
    expect(projectUpdated?.name).toEqual('Updated Project');
    expect(projectUpdated?.description).toEqual('Project Description 2');
    expect(projectUpdated?.tags).toEqual(['tag3']);
    const pinnedProjectUpdated = result.pinnedProjects.find((project) => project.id === payload.id);
    expect(pinnedProjectUpdated?.name).toEqual('Updated Project');
    expect(pinnedProjectUpdated?.description).toEqual('Project Description 2');
    expect(pinnedProjectUpdated?.tags).toEqual(['tag3']);
    expect(pinnedProjectUpdated?.pinned).toBeTruthy();
  });

  it('should update a project but not the pinned project list', () => {
    const payload = {
      ...mockProjectInfoArray[1],
      name: 'Updated Project not pinned',
      description: 'Project Description 5',
      tags: ['tag3', 'tag5'],
    };

    const result = updateProject(initialState, payload);

    const projectUpdated = result.projects.find((project) => project.id === payload.id);
    expect(projectUpdated?.name).toEqual('Updated Project not pinned');
    expect(projectUpdated?.description).toEqual('Project Description 5');
    expect(projectUpdated?.tags).toEqual(['tag3', 'tag5']);
    expect(result.pinnedProjects).toEqual(mockPinProjectResponseArray);
  });
});

describe('removeProject', () => {
  it('should remove project from both lists if present', () => {
    const result = removeProject(initialState, '123');

    expect(result.projects).toEqual([
      {
        id: '125',
        name: 'Bilan prévisionnel 2019',
        description: 'Project Description',
        createdBy: 'User B',
        creationDate: '2013-08-01' as unknown as Date,
        tags: ['tag3', 'tag4'],
        path: '',
        studies: [],
        archived: false,
        pinned: false,
      },
    ]);
    expect(result.pinnedProjects).toEqual([
      {
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
      },
    ]);
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
    expect(result.pinnedProjects[0]).toMatchObject({ ...mockProjectInfo, pinned: true });

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
        pinned: true,
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

vi.mock('./projectReducer', () => ({
  addProject: vi.fn(() => ({ added: true })),
  updateProject: vi.fn(() => ({ update: true })),
  removeProject: vi.fn(() => ({ remove: true })),
  addPinnedProject: vi.fn(() => ({ addPinned: true })),
  unpinPinnedProject: vi.fn(() => ({ unpin: true })),
}));

describe('projectReducer', () => {
  it('should handle ADD_PROJECT', () => {
    const payload = { id: 1, name: 'New Project' } as unknown as ProjectInfo;
    const action: ProjectActionType = {
      type: PROJECT_ACTION.ADD_PROJECT,
      payload,
    };

    const result = projectReducer(initialState, action);
    expect(result.projects).toEqual([payload, ...mockProjectInfoArray]);
  });

  it('should handle UPDATE_PROJECT', () => {
    const payload = {
      id: '123',
      name: 'Updated Project',
      description: 'Project Description',
      createdBy: 'User A',
      creationDate: '2024-01-01' as unknown as Date,
      tags: ['tag1', 'tag2'],
      path: '',
      studies: [],
      archived: false,
      pinned: false,
    } as unknown as ProjectInfo;

    const result = projectReducer(initialState, {
      type: PROJECT_ACTION.UPDATE_PROJECT,
      payload,
    });

    expect(result.projects).toEqual([
      {
        id: '123',
        name: 'Updated Project',
        description: 'Project Description',
        createdBy: 'User A',
        creationDate: '2024-01-01' as unknown as Date,
        tags: ['tag1', 'tag2'],
        path: '',
        studies: [],
        archived: false,
        pinned: false,
      },
      {
        id: '125',
        name: 'Bilan prévisionnel 2019',
        description: 'Project Description',
        createdBy: 'User B',
        creationDate: '2013-08-01' as unknown as Date,
        tags: ['tag3', 'tag4'],
        path: '',
        studies: [],
        archived: false,
        pinned: false,
      },
    ]);
  });

  it('should handle REMOVE_PROJECT', () => {
    const payload = '123';

    const result = projectReducer(initialState, {
      type: PROJECT_ACTION.REMOVE_PROJECT,
      payload,
    });

    expect(result.projects).toEqual([
      {
        id: '125',
        name: 'Bilan prévisionnel 2019',
        description: 'Project Description',
        createdBy: 'User B',
        creationDate: '2013-08-01' as unknown as Date,
        tags: ['tag3', 'tag4'],
        path: '',
        studies: [],
        archived: false,
        pinned: false,
      },
    ]);
  });

  it('should handle INIT_PROJECT_LIST', () => {
    const payload = [{ id: 1, name: 'Init Project' }] as unknown as ProjectInfo[];
    const result = projectReducer(initialState, {
      type: PROJECT_ACTION.INIT_PROJECT_LIST,
      payload,
    });

    expect(result.projects).toEqual(payload);
    expect(result.pinnedProjects).toEqual(mockPinProjectResponseArray);
  });

  it('should handle ADD_PINNED_PROJECT', () => {
    const payload = { id: 2, name: 'Pinned Project' } as unknown as ProjectInfo;

    const result = projectReducer(initialState, {
      type: PROJECT_ACTION.ADD_PINNED_PROJECT,
      payload,
    });

    expect(result.pinnedProjects).toEqual([...mockPinProjectResponseArray, payload]);
  });

  it('should handle UNPIN_PINNED_PROJECT', () => {
    const payload = '124';

    const result = projectReducer(initialState, {
      type: PROJECT_ACTION.UNPIN_PINNED_PROJECT,
      payload,
    });

    expect(result.pinnedProjects).toEqual([
      {
        id: '123',
        name: 'Project Name',
        description: 'Project Description',
        createdBy: 'User A',
        creationDate: '2024-07-25T10:09:41' as unknown as Date,
        tags: ['tag1', 'tag2'],
        archived: true,
        pinned: true,
        path: '',
        studies: [1, 2],
      },
    ]);
  });

  it('should handle INIT_PINNED_PROJECT_LIST', () => {
    const payload = [{ id: 3, name: 'Pinned Init' }] as unknown as ProjectInfo[];
    const result = projectReducer(initialState, {
      type: PROJECT_ACTION.INIT_PINNED_PROJECT_LIST,
      payload,
    });

    expect(result.projects).toEqual(mockProjectInfoArray);
    expect(result.pinnedProjects).toEqual(payload);
  });

  it('should return previous state if action is undefined', () => {
    const result = projectReducer(initialState, undefined);
    expect(result).toEqual(initialState);
  });

  it('should return previous state for unknown action type', () => {
    const action = { type: 'UNKNOWN_ACTION' } as unknown as ProjectActionType;
    const result = projectReducer(initialState, action);

    expect(result).toEqual(initialState);
  });
});
