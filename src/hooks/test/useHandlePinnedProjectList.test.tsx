/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { act, Queries, renderHook, RenderHookOptions, waitFor } from '@testing-library/react';
import { useHandlePinnedProjectList } from '@/hooks/useHandlePinnedProjectList';
import { beforeEach, describe, expectTypeOf, it, Mock, vi } from 'vitest';
import { ProjectProvider, ProjectProviderProps } from '@/store/contexts/ProjectProvider.tsx';
import { useProjectDispatch } from '@/store/contexts/ProjectContext';
import { fetchPinnedProjects, pinProject, unpinProject } from '@/shared/services/pinnedProjectService.ts';
import { v4 as uuidv4 } from 'uuid';
import { notifyToast } from '@/shared/notification/notification.tsx';
import { PROJECT_ACTION } from '@/shared/enum/project.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { UserState } from '@/shared/types';
import { mockPinProjectResponse, mockProjectsApiResponse } from '@/mocks/data/tests/pinnedProject.mock';

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
    useProjectDispatch: vi.fn(() => ({
      dispatch: vi.fn(),
    })),
  };
});
vi.mock('@/store/contexts/UserContext', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    useUser: vi.fn(),
  };
});

describe('useHandlePinnedProjectList', () => {
  const mockUsePinnedProjectDispatch = useProjectDispatch as Mock<typeof useProjectDispatch>;
  const mockUseUser = useUser as Mock<typeof useUser>;
  const mockDispatch = vi.fn().mockImplementation(vi.fn());

  beforeEach(() => {
    global.fetch = vi.fn();
    mockUseUser.mockImplementation(() => ({ user: { profile: { sub: 'testUser' } } }) as UserState);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should trigger getPinnedProject method on init and call dispatch to update pinned project list correctly', async () => {
    const mockFetchPinnedProjects = fetchPinnedProjects as Mock;
    mockFetchPinnedProjects.mockResolvedValueOnce(mockProjectsApiResponse);
    mockUsePinnedProjectDispatch.mockReturnValue(mockDispatch);

    const wrapper = ({ children, initialValue }: ProjectProviderProps) => (
      <ProjectProvider initialValue={initialValue}>{children}</ProjectProvider>
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
      expect(fetchPinnedProjects).toHaveBeenCalledWith('testUser');
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
    mockPinProject.mockResolvedValueOnce(mockPinProjectResponse);
    mockUsePinnedProjectDispatch.mockReturnValue(mockDispatch);
    const id = uuidv4();

    const wrapper = ({ children, initialValue }: ProjectProviderProps) => (
      <ProjectProvider initialValue={initialValue}>{children}</ProjectProvider>
    );

    const { result } = renderHook(() => useHandlePinnedProjectList(), {
      wrapper,
      initialProps: { initialValue: { pinnedProject: [] } },
    } as RenderHookOptions<{ initialValue: { pinnedProject: never[]; projects: [] } }, Queries>);

    await act(async () => result.current.handlePinProject(6));

    await waitFor(() => {
      expect(pinProject).toHaveBeenCalledWith(6, 'testUser');
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: PROJECT_ACTION.ADD_PINNED_PROJECT,
        payload: mockPinProjectResponse,
      });
      expect(notifyToast).toHaveBeenCalledWith({
        id,
        type: 'success',
        message: 'Project pinned successfully',
      });
    });
  });

  it('should call handlePinProject and catch error when pinProject throws one', async () => {
    const mockPinProject = pinProject as Mock;
    mockPinProject.mockRejectedValueOnce({ message: 'error' });
    mockUsePinnedProjectDispatch.mockReturnValue(mockDispatch);
    const id = uuidv4();

    const wrapper = ({ children, initialValue }: ProjectProviderProps) => (
      <ProjectProvider initialValue={initialValue}>{children}</ProjectProvider>
    );

    const { result } = renderHook(() => useHandlePinnedProjectList(), {
      wrapper,
      initialProps: { initialValue: { pinnedProject: [] } },
    } as RenderHookOptions<{ initialValue: { pinnedProject: never[] } }, Queries>);

    await act(async () => result.current.handlePinProject(8));

    await waitFor(() => {
      expect(pinProject).toHaveBeenCalledWith(8, 'testUser');
      expect(mockDispatch).toHaveBeenCalledTimes(0);
      expect(notifyToast).toHaveBeenCalledWith({
        id,
        type: 'error',
        message: 'error',
      });
    });
  });

  it('should call handleUnpinProject that calls unpinProject and dispatch and update pinned project list correctly', async () => {
    mockUsePinnedProjectDispatch.mockReturnValue(mockDispatch);
    const id = uuidv4();

    const wrapper = ({ children, initialValue }: ProjectProviderProps) => (
      <ProjectProvider initialValue={initialValue}>{children}</ProjectProvider>
    );

    const { result } = renderHook(() => useHandlePinnedProjectList(), {
      wrapper,
      initialProps: { initialValue: { pinnedProject: mockProjectsApiResponse } },
    } as RenderHookOptions<{ initialValue: { pinnedProject: never[]; projects: [] } }, Queries>);

    await act(async () => result.current.handleUnpinProject(2));

    await waitFor(() => {
      expect(unpinProject).toHaveBeenCalledWith(2, 'testUser');
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: PROJECT_ACTION.UNPIN_PINNED_PROJECT,
        payload: 2,
      });
      expect(notifyToast).toHaveBeenCalledWith({
        id,
        type: 'success',
        message: 'Project unpinned successfully',
      });
    });
  });

  it('should call handlePinProject and catch error when unpinProject throws one', async () => {
    const mockUnpinProject = unpinProject as Mock;
    mockUnpinProject.mockRejectedValueOnce({ message: 'error' });
    mockUsePinnedProjectDispatch.mockReturnValue(mockDispatch);
    const id = uuidv4();

    const wrapper = ({ children, initialValue }: ProjectProviderProps) => (
      <ProjectProvider initialValue={initialValue}>{children}</ProjectProvider>
    );

    const { result } = renderHook(() => useHandlePinnedProjectList(), {
      wrapper,
      initialProps: { initialValue: { pinnedProject: [] } },
    } as RenderHookOptions<{ initialValue: { pinnedProject: never[] } }, Queries>);

    await act(async () => result.current.handleUnpinProject(2));

    await waitFor(() => {
      expect(unpinProject).toHaveBeenCalledWith(2, 'testUser');
      expect(mockDispatch).toHaveBeenCalledTimes(0);
      expect(notifyToast).toHaveBeenCalledWith({
        id,
        type: 'error',
        message: 'error',
      });
    });
  });
});
