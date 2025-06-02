/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { fetchPinnedProjects, pinProject, unpinProject } from '../pinnedProjectService';
import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { mockResponse, mockResponseArray } from '@/shared/services/test/mocks/pinnedProjectMock.tsx';
import { AuthService } from '@/shared/services/authService.ts';
import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';

vi.mock('@/shared/notification/notification');
vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));
vi.mock('@/shared/services/authService');

const projectId = 'test-project-id';
const userId = 'testUser';

describe('pinProject', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.stubGlobal('JSON', {
      parse: (text: string) => ({ message: text }),
      stringify: (text: string) => text,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should successfully pin a project and call notifyToast with success', async () => {
    vi.mocked(AuthService.authFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockResponse),
    } as Response);

    const response = await pinProject(projectId, userId);

    expect(AuthService.authFetch).toHaveBeenCalledWith(
      'https://mockapi.com/v1/project/pin?userId=testUser&projectId=test-project-id',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    expect(response).toEqual(mockResponse);
  });

  it('should handle pin project error ', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to pin project',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => pinProject(projectId, userId)).rejects.toThrowError('Failed to pin project');
  });
});

describe('fetchPinnedProjects', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.stubGlobal('JSON', {
      parse: (text: string) => ({ message: text }),
      stringify: (text: string) => text,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should fetch pinned project list', async () => {
    vi.mocked(AuthService.authFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockResponseArray),
    } as Response);

    const result = await fetchPinnedProjects(userId);

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(`https://mockapi.com/v1/project/pinned?userId=${userId}`);
      expect(result).toEqual(mockResponseArray);
    });
  });

  it('should handle fetch failure gracefully', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to fetch project details',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => fetchPinnedProjects(userId)).rejects.toThrowError('Failed to fetch project details');
  });
});

describe('unpinProject', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should unpin project from pinned project list', async () => {
    vi.mocked(AuthService.authFetch).mockResolvedValueOnce({
      ok: true,
    } as Response);

    await unpinProject(projectId, userId);

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(
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
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to unpin project',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => unpinProject(projectId, userId)).rejects.toThrowError('Failed to unpin project');
  });
});
