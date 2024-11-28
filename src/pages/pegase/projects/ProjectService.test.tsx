/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import { notifyToast } from '@/shared/notification/notification';
import { pinProject, useFetchProjects } from './projectService';

const mockFetch = vi.fn();
global.fetch = mockFetch;
vi.mock('@/shared/notification/notification');
vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));

describe('useFetchProjects', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            content: [
              {
                projectId: '1',
                name: 'Project 1',
                tags: ['Tag1', 'Tag2'],
                creationDate: '2023-10-01',
                createdBy: 'User A',
              },
            ],
            totalElements: 1,
          }),
      }),
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches projects on mount', async () => {
    const { result } = renderHook(() => useFetchProjects('', 0, 9));

    await waitFor(() => {
      expect(result.current.projects).toEqual([
        {
          projectId: '1',
          name: 'Project 1',
          tags: ['Tag1', 'Tag2'],
          creationDate: '2023-10-01',
          createdBy: 'User A',
        },
      ]);
      expect(result.current.count).toBe(1);
    });
  });

  it('fetches projects with search term', async () => {
    renderHook(() => useFetchProjects('test', 0, 9));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://mockapi.com/v1/project/search?page=1&size=9&search=test');
    });
  });

  it('fetches projects with pagination', async () => {
    renderHook(() => useFetchProjects('', 1, 9));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://mockapi.com/v1/project/search?page=2&size=9&search=');
    });
  });
});

describe('pinProject', () => {
  const mockIsReloadPinnedProject = vi.fn();
  const projectId = 'test-project-id';

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully pin a project and call notifyToast with success', async () => {
    const mockResponse = { ok: true }; // Simulate successful fetch response
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

    await pinProject(projectId, mockIsReloadPinnedProject);

    // Check fetch call
    expect(fetch).toHaveBeenCalledWith('https://mockapi.com/v1/project/pin?userId=me00247&projectId=test-project-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    // Verify notifyToast was called with success
    expect(notifyToast).toHaveBeenCalledWith({
      type: 'success',
      message: 'Project pinned successfully',
    });

    // Verify isReloadPinnedProject was called
    expect(mockIsReloadPinnedProject).toHaveBeenCalledWith(true);
  });

  it('should handle fetch-level errors and call notifyToast with error', async () => {
    const networkErrorMessage = 'Network error';
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error(networkErrorMessage));

    await pinProject(projectId, mockIsReloadPinnedProject);

    // Verify notifyToast was called with the network error
    expect(notifyToast).toHaveBeenCalledWith({
      type: 'error',
      message: networkErrorMessage,
    });

    // Verify isReloadPinnedProject was not called
    expect(mockIsReloadPinnedProject).not.toHaveBeenCalled();
  });
});
