/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { deleteProjectById, fetchProjectDetails } from '../projectService.ts';
import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { notifyToast } from '@/shared/notification/notification.tsx';

const mockFetch = vi.fn();
global.fetch = mockFetch;
vi.mock('@/shared/notification/notification');
vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));

describe('deleteProjectById', () => {
  const projectId = '123';

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delete a pinned project from pinned project list', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
    });

    await deleteProjectById(projectId);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(`https://mockapi.com/v1/project/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // Verify notifyToast was called with success
      expect(notifyToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'Project deleted successfully',
      });
    });
  });

  it('should handle delete failure gracefully', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      text: async () => 'Error',
    });

    const result = await deleteProjectById(projectId);

    expect(result).toEqual(undefined);
  });

  it('should handle exceptions during delete', async () => {
    //Fetch throwing an error mock
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    await deleteProjectById(projectId);

    // Verify notifyToast was called with error
    expect(notifyToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Network error',
    });
  });
});

describe('fetchProjectDetails', () => {
  const projectId = '123';
  const mockResponse = {
    id: '123',
    name: 'Project Name',
    description: 'Project Description',
    createdBy: 'User A',
    creationDate: '2024-01-01',
    tags: ['tag1', 'tag2'],
  };

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch project details', async () => {
    //Successful fetch response mock
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await fetchProjectDetails(projectId);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(`https://mockapi.com/v1/project/${projectId}`);
    });
  });

  it('should handle fetch failure gracefully', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    });

    await expect(async () => fetchProjectDetails(projectId)).rejects.toThrowError('Failed to fetch project details');
  });

  it('should handle exceptions during fetch', async () => {
    //Fetch throwing an error mock
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    await expect(async () => fetchProjectDetails(projectId)).rejects.toThrowError('Network error');
  });
});
