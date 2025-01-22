/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { fetchPinnedProjects, pinProject, unpinProject } from '../pinnedProjectService';
import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;
vi.mock('@/shared/notification/notification');
vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));

describe('pinProject', () => {
  const projectId = 'test-project-id';

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully pin a project and call notifyToast with success', async () => {
    const mockResponse = {
      id: '123',
      name: 'Project Name',
      description: 'Project Description',
      createdBy: 'User A',
      creationDate: '2024-01-01',
      tags: ['tag1', 'tag2'],
    };
    const mockResponseApi = { ok: true, json: async () => mockResponse }; // Simulate successful fetch response
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponseApi);

    const response = await pinProject(projectId);

    // Check fetch call
    expect(fetch).toHaveBeenCalledWith('https://mockapi.com/v1/project/pin?userId=me00247&projectId=test-project-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response).toEqual(mockResponse);
  });

  it('should handle pin project error ', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      text: async () => 'Error message',
    });

    await expect(async () => pinProject(projectId)).rejects.toThrowError('Error message');
  });
});

describe('fetchPinnedProjects', () => {
  const userId = '123';
  const mockResponse = [
    {
      id: '123',
      projectId: '123',
      name: 'Project Name',
      description: 'Project Description',
      createdBy: 'User A',
      creationDate: '2024-01-01',
      tags: ['tag1', 'tag2'],
      archived: true,
      pinned: true,
      path: '',
      studies: [1, 2],
    },
    {
      id: '124',
      projectId: '124',
      name: 'Project Name 3',
      description: 'Project Description',
      createdBy: 'User A',
      creationDate: '2024-01-01',
      tags: ['tag1', 'tag2'],
      archived: true,
      pinned: true,
      path: '',
      studies: [1, 2],
    },
  ];

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
      json: async () => mockResponse,
    });

    const result = await fetchPinnedProjects(userId);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(`https://mockapi.com/v1/project/pinned?userId=${userId}`);
      expect(result).toEqual(mockResponse);
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
  const userId = '123';
  const projectId = 'project-id';

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
      json: async () => mockResponse,
    });

    await unpinProject(userId, projectId);

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
      text: async () => 'Error message',
    });

    await expect(async () => unpinProject(userId, projectId)).rejects.toThrowError('Error message');
  });
});
