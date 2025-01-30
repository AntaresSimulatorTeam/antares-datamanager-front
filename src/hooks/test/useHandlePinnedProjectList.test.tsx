/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { act, Queries, renderHook, RenderHookOptions, waitFor } from '@testing-library/react';
import { useHandlePinnedProjectList } from '@/hooks/useHandlePinnedProjectList';
import { afterEach, beforeEach, describe, expectTypeOf, it, Mock, vi } from 'vitest';
import { ProjectProvider, ProjectProviderProps, useProjectDispatch } from '@/store/contexts/ProjectContext';
import { fetchPinnedProjects, pinProject } from '@/shared/services/pinnedProjectService.ts';
import { v4 as uuidv4 } from 'uuid';
import { notifyToast } from '@/shared/notification/notification.tsx';
import { PROJECT_ACTION } from '@/shared/enum/project.ts';

const mockProjectsApiResponse = [
  {
    id: '1',
    name: 'Bilan previsionnel 2027',
    createdBy: 'MOUAD Paris test',
    creationDate: '2024-07-25T10:09:41',
    studies: [1, 2, 3],
    tags: ['gaz', 'elec', 'antares', 'misc', 'tag2 antares', 'area link'],
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    projectId: '1',
    pinned: true,
  },
  {
    id: '2',
    name: 'Bilan previsionnel 2023',
    createdBy: 'Taher benjelloun amine',
    creationDate: '2024-07-25T10:09:41',
    studies: [6, 5, 9],
    tags: ['bilan 22'],
    description: 'description2023',
    projectId: '2',
    pinned: true,
  },
  {
    id: '3',
    name: 'Bilan previsionnel 2025',
    createdBy: 'zayd guillaume pegase',
    creationDate: '2024-07-25T10:09:41',
    studies: [7, 8],
    tags: ['figma', 'config', 'modal'],
    description: 'In the world of software development, achieving perfection is a journey rather than a destination.',
    projectId: '3',
    pinned: true,
  },
];

vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));
vi.mock('@/shared/notification/notification');
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mocked-uuid'),
}));

vi.mock('@/shared/services/pinnedProjectService');
vi.mock('@/store/contexts/ProjectContext', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    useProject: vi.fn(),
    useProjectDispatch: vi.fn(() => {
      return {
        dispatch: vi.fn(),
      };
    }),
  };
});

describe('useHandlePinnedProjectList', () => {
  const mockUsePinnedProjectDispatch = useProjectDispatch as Mock<typeof useProjectDispatch>;
  const mockDispatch = vi.fn().mockImplementation(vi.fn());

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should trigger getPinnedProject method on init and call dispatch to update pinned project list correctly', async () => {
    const mockFetchPinnedProjects = fetchPinnedProjects as Mock;
    mockFetchPinnedProjects.mockResolvedValueOnce(mockProjectsApiResponse);

    mockUsePinnedProjectDispatch.mockReturnValue(mockDispatch);

    const wrapper = ({ children, initialValue }: ProjectProviderProps) => (
      <ProjectProvider children={children} initialValue={initialValue}></ProjectProvider>
    );

    const { result } = renderHook(() => useHandlePinnedProjectList(), {
      wrapper,
      initialProps: { initialValue: { projects: [], pinnedProject: [] } },
    } as RenderHookOptions<{ initialValue: { projects: never[]; pinnedProject: never[] } }, Queries>);

    await waitFor(() => {
      expectTypeOf(result.current.getPinnedProjects).toBeFunction();
      expectTypeOf(result.current.handleUnpinProject).toBeFunction();
      expectTypeOf(result.current.handlePinProject).toBeFunction();
      expect(fetchPinnedProjects).toHaveBeenCalledTimes(1);
      expect(fetchPinnedProjects).toHaveBeenCalledWith('me00247');
      expect(mockUsePinnedProjectDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: PROJECT_ACTION.INIT_PINNED_PROJECT_LIST,
        payload: mockProjectsApiResponse,
      });
    });
  });

  it('should call handlePinProject that calls pinProject and dispatch and update pinned project list correctly', async () => {
    const mockPinProject = pinProject as Mock;
    const mockPinProjectResponse = {
      id: '3',
      name: 'Bilan previsionnel 2025',
      createdBy: 'zayd guillaume pegase',
      creationDate: '2024-07-25T10:09:41',
      studies: [7, 8],
      tags: ['figma', 'config', 'modal'],
      description: 'In the world of software development, achieving perfection is a journey rather than a destination.',
      projectId: '3',
      pinned: true,
    };
    mockPinProject.mockResolvedValueOnce(mockPinProjectResponse);

    mockUsePinnedProjectDispatch.mockReturnValue(mockDispatch);

    const id = uuidv4();

    const wrapper = ({ children, initialValue }: ProjectProviderProps) => (
      <ProjectProvider children={children} initialValue={initialValue}></ProjectProvider>
    );

    const { result } = renderHook(() => useHandlePinnedProjectList(), {
      wrapper,
      initialProps: { initialValue: { pinnedProject: [] } },
    } as RenderHookOptions<{ initialValue: { pinnedProject: never[]; projects: [] } }, Queries>);

    await act(async () => result.current.handlePinProject('me00247'));

    await waitFor(() => {
      expect(pinProject).toHaveBeenCalledWith('me00247');
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: PROJECT_ACTION.ADD_PINNED_PROJECT,
        payload: mockPinProjectResponse,
      });
      expect(notifyToast).toHaveBeenCalledWith({
        id: id,
        type: 'success',
        message: 'Project pinned successfully',
      });
    });
  });

  it('should call handlePinProject and catch error when pinProject throws one', async () => {
    const mockPinProject = pinProject as Mock;
    mockPinProject.mockRejectedValueOnce('error');

    mockUsePinnedProjectDispatch.mockReturnValue(mockDispatch);

    const id = uuidv4();

    const wrapper = ({ children, initialValue }: ProjectProviderProps) => (
      <ProjectProvider children={children} initialValue={initialValue}></ProjectProvider>
    );

    const { result } = renderHook(() => useHandlePinnedProjectList(), {
      wrapper,
      initialProps: { initialValue: { pinnedProject: [] } },
    } as RenderHookOptions<{ initialValue: { pinnedProject: never[] } }, Queries>);

    await act(async () => result.current.handlePinProject('me00247'));

    await waitFor(() => {
      expect(pinProject).toHaveBeenCalledWith('me00247');
      expect(mockDispatch).toHaveBeenCalledTimes(0);
      expect(notifyToast).toHaveBeenCalledWith({
        id: id,
        type: 'error',
        message: 'Project already pinned',
      });
    });
  });
});
