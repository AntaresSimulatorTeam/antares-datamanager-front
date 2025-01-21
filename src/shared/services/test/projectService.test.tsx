/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { notifyToast } from '@/shared/notification/notification.tsx';
import { fetchProjectDetails, pinProject } from '../projectService.ts';
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
    const mockResponse = { ok: true }; // Simulate successful fetch response
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

    await pinProject(projectId);

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
  });

  it('should handle fetch-level errors and call notifyToast with error', async () => {
    const networkErrorMessage = 'Network error';
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error(networkErrorMessage));

    await pinProject(projectId);

    // Verify notifyToast was called with the network error
    expect(notifyToast).toHaveBeenCalledWith({
      type: 'error',
      message: networkErrorMessage,
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
