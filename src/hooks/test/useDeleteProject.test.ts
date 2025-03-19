/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { useDeleteProject } from '@/hooks/useDeleteProject.ts';
import { expectTypeOf, Mock, vi } from 'vitest';
import { PROJECT_ACTION } from '@/shared/enum/project.ts';
import { notifyToast } from '@/shared/notification/notification.tsx';
import * as projectService from '@/shared/services/projectService.ts';
import { useProjectDispatch } from '@/store/contexts/ProjectContext.tsx';

const mockFetch = vi.fn();
global.fetch = mockFetch;
vi.mock('@/shared/notification/notification');
vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));
vi.mock('@/store/contexts/ProjectContext', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    useProjectDispatch: vi.fn(() => ({
      dispatch: vi.fn(),
    })),
  };
});
vi.mock('@/shared/services/projectService');

describe('useDeleteProject', () => {
  const mockUseProjectDispatch = useProjectDispatch as Mock<typeof useProjectDispatch>;
  const mockDispatch = vi.fn().mockImplementation(vi.fn());
  mockUseProjectDispatch.mockReturnValue(mockDispatch);
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return deleteProject method and delete project successfully', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
    });
    const { result } = renderHook(() => useDeleteProject());

    await waitFor(() => {
      expectTypeOf(result.current.deleteProject).toBeFunction();
    });

    await act(async () => result.current.deleteProject('projectId'));

    await waitFor(() => {
      expect(projectService.deleteProjectById).toHaveBeenCalledWith('projectId');
      expect(projectService.deleteProjectById).toHaveBeenCalledTimes(1);
      expect(mockUseProjectDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: PROJECT_ACTION.REMOVE_PROJECT,
        payload: 'projectId',
      });
      expect(notifyToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'Project deleted successfully',
      });
    });
  });
});
