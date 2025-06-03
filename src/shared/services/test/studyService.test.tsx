/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import {
  createStudy,
  deleteStudy,
  fetchSearchStudies,
  fetchSuggestedKeywords,
  getStudyTrajectories,
  saveStudy,
} from '@/shared/services/studyService.ts';
import { notifyToast } from '@/shared/notification/notification.tsx';
import { mockStudy, mockStudyResponse } from '@/shared/services/test/mocks/studyMock.tsx';
import { mockDbTrajectoryArray } from '@/shared/services/test/mocks/trajectoryMock.tsx';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';
import { AuthService } from '@/shared/services/authService.ts';

vi.mock('@/shared/notification/notification');
vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));
vi.mock('@/shared/services/authService');

describe('fetchSearchStudies', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch study list', async () => {
    vi.mocked(AuthService.authFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockStudyResponse),
    } as Response);

    const result = await fetchSearchStudies('test', '124', 3, 10, { column: 'asc' });

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/study/search?page=4&size=10&projectId=124&search=test&sortColumn=column&sortDirection=asc`,
      );
      expect(result).toEqual(mockStudyResponse);
    });
  });

  it('should handle fetch failure gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () =>
        Promise.resolve({
          antaresErrorMessage: 'Failed to fetch user studies',
          date: new Date(),
          type: ERROR_MESSAGE_TYPE.BUSINESS,
        }),
    });

    await expect(async () => fetchSearchStudies('test', '124', 3, 10, { column: 'asc' })).rejects.toThrowError(
      'Failed to fetch user studies',
    );
  });
});

describe('fetchSuggestedKeywords', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return suggested keywords', async () => {
    const mockResponse = ['keyword1', 'keyword2', 'keyword3'];
    vi.mocked(AuthService.authFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockResponse),
    } as Response);

    const result = await fetchSuggestedKeywords('test');

    expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
    expect(AuthService.authFetch).toHaveBeenCalledWith('https://mockapi.com/v1/study/keywords/search?partialName=test');
    expect(result).toEqual(mockResponse);
  });

  it('should handle fetch failure gracefully', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve('Failed to fetch suggested keywords'),
    });

    await expect(async () => fetchSuggestedKeywords('test')).rejects.toThrowError('Failed to fetch suggested keywords');
  });
});

describe('saveStudy', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a study', async () => {
    vi.mocked(AuthService.authFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(),
    } as Response);

    await saveStudy(mockStudy);

    expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
    expect(AuthService.authFetch).toHaveBeenCalledWith('https://mockapi.com/v1/study', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockStudy),
    });
    expect(notifyToast).toHaveBeenCalledWith({
      type: 'success',
      message: 'Study created successfully',
    });
  });

  it('should display a toast with the backend error message', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'A study with the same name already exists',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await saveStudy(mockStudy);

    expect(notifyToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'A study with the same name already exists',
    });
  });
});

describe('deleteStudy', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delete a study', async () => {
    vi.mocked(AuthService.authFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(),
    } as Response);

    await deleteStudy(5);

    expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
    expect(AuthService.authFetch).toHaveBeenCalledWith('https://mockapi.com/v1/study/5', {
      method: 'DELETE',
    });
    expect(notifyToast).toHaveBeenCalledWith({
      type: 'success',
      message: 'Study deleted successfully',
    });
  });

  it('should throw an error message', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to delete study',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    const result = await deleteStudy(2);
    expect(result).toEqual(undefined);
    expect(notifyToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Failed to delete study',
    });
  });
});

describe('getStudyTrajectories', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should retrieve trajectories from study id and trajectory type', async () => {
    vi.mocked(AuthService.authFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockDbTrajectoryArray),
    } as Response);

    await getStudyTrajectories(1, TRAJECTORY_TYPE.AREA);

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory?studyId=1&trajectoryType=AREA`,
      );
    });
  });

  it('should handle fetch failure gracefully', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to fetch trajectories',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => getStudyTrajectories(1, TRAJECTORY_TYPE.AREA)).rejects.toThrowError(
      'Failed to fetch trajectories',
    );
  });
});

describe('createStudy', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate a study', async () => {
    vi.mocked(AuthService.authFetch).mockResolvedValueOnce({
      ok: true,
    } as Response);

    await createStudy(5);

    expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
    expect(AuthService.authFetch).toHaveBeenCalledWith('https://mockapi.com/v1/study/generate?id=5', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should throw an error message', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to generate a study',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => createStudy(1)).rejects.toThrowError('Failed to generate a study');
  });
});
