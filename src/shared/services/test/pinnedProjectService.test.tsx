/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { fetchPinnedProjects, pinProject, unpinProject } from '../pinnedProjectService';
import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { mockPinProjectResponseArray, mockResponse } from '@/mocks/data/tests/pinnedProject.mock.ts';
import { AuthService } from '@/shared/services/authService.ts';
import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';
import { DEFAULT_USER } from '@/shared/const/authConfig.ts';

vi.mock('@/shared/notification/notification');
vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));
vi.mock('@/shared/services/authService');

const projectId = 123;
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
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockResponse),
    });

    const response = await pinProject(projectId, userId);

    expect(AuthService.authFetch).toHaveBeenCalledWith(
      `https://mockapi.com/v1/project/pin?userId=testUser&projectId=${projectId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    expect(response).toEqual(mockResponse);
  });

  it('should call pin project service with default user id when no one is provided', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockResponse),
    });

    await pinProject(projectId, undefined);

    expect(AuthService.authFetch).toHaveBeenCalledWith(
      `https://mockapi.com/v1/project/pin?userId=${DEFAULT_USER}&projectId=${projectId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );
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
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockPinProjectResponseArray),
    });

    const result = await fetchPinnedProjects(userId);

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(`https://mockapi.com/v1/project/pinned?userId=${userId}`);
      expect(result).toEqual(mockPinProjectResponseArray);
    });
  });

  it('should call fetchPinnedProjects service with default user id when no one is provided', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockPinProjectResponseArray),
    });
    await fetchPinnedProjects(undefined);
    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/project/pinned?userId=${DEFAULT_USER}`,
      );
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
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
    });

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

  it('should call unpinProject service with default user id when no one is provided', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
    });

    await unpinProject(projectId, undefined);

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/project/unpin?userId=${DEFAULT_USER}&projectId=${projectId}`,
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
