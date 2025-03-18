/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { fetchPinnedProjects, pinProject, unpinProject } from '../pinnedProjectService';
import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { mockResponse, mockResponseArray } from '@/shared/services/test/mocks/pinnedProjectMock.tsx';

vi.mock('@/shared/notification/notification');
vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));
const projectId = 'test-project-id';
const userId = 'testUser';

describe('pinProject', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully pin a project and call notifyToast with success', async () => {
    const mockResponseApi = { ok: true, json: async () => Promise.resolve(mockResponse) }; // Simulate successful fetch response
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponseApi);

    const response = await pinProject(projectId, userId);

    // Check fetch call
    expect(fetch).toHaveBeenCalledWith('https://mockapi.com/v1/project/pin?userId=testUser&projectId=test-project-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response).toEqual(mockResponse);
  });

  it('should handle pin project error ', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () =>
        Promise.resolve({
          message: 'Error message',
        }),
    });

    await expect(async () => pinProject(projectId, userId)).rejects.toThrowError('Error message');
  });
});

describe('fetchPinnedProjects', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch pinned project list', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockResponseArray),
    });

    const result = await fetchPinnedProjects(userId);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(`https://mockapi.com/v1/project/pinned?userId=${userId}`, {});
      expect(result).toEqual(mockResponseArray);
    });
  });

  it('should handle fetch failure gracefully', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    });

    await expect(async () => fetchPinnedProjects(userId)).rejects.toThrowError('Failed to fetch project details');
  });
});

describe('unpinProject', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should unpin project from pinned project list', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
    });

    await unpinProject(projectId, userId);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/project/unpin?userId=${userId}&projectId=${projectId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    });
  });

  it('should handle fetch failure gracefully', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      text: async () => Promise.resolve('Error message'),
    });

    await expect(async () => unpinProject(projectId, userId)).rejects.toThrowError('Error message');
  });
});
