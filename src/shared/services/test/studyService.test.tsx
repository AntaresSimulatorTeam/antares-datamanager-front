/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { describe, expect, Mock, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import {
  deleteStudy,
  duplicateStudy,
  fetchSearchStudies,
  fetchSuggestedKeywords,
  generateStudy,
  getStudyById,
  getStudyTrajectories,
  saveStudy,
  updateStudy,
} from '@/shared/services/studyService.ts';
import { notifyAlert, notifyToast } from '@/shared/notification/notification.tsx';
import { mockStudy, mockStudyResponse } from '@/mocks/data/tests/study.mock.ts';
import { mockDbTrajectoryArray } from '@/mocks/data/tests/trajectory.mock.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';
import { AuthService } from '@/shared/services/authService.ts';
import { StudyDTO } from '@/shared/types';

vi.mock('@/shared/notification/notification');
vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));
vi.mock('@/shared/services/authService');

vi.mock('@/shared/services/warningService', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    fetchWarningMessages: vi.fn(),
  };
});

describe('fetchSearchStudies', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch study list', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockStudyResponse),
    });

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
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to fetch user studies',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => fetchSearchStudies('test', '124', 3, 10, { column: 'asc' })).rejects.toThrowError(
      'Failed to fetch user studies',
    );
  });
});

describe('fetchSuggestedKeywords', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return suggested keywords', async () => {
    const mockResponse = ['keyword1', 'keyword2', 'keyword3'];
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockResponse),
    });

    const result = await fetchSuggestedKeywords('test');

    expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
    expect(AuthService.authFetch).toHaveBeenCalledWith('https://mockapi.com/v1/study/keywords/search?partialName=test');
    expect(result).toEqual(mockResponse);
  });

  it('should return suggested keywords', async () => {
    const mockResponse = [] as string[];
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockResponse),
    });

    const result = await fetchSuggestedKeywords('');

    expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
    expect(AuthService.authFetch).toHaveBeenCalledWith('https://mockapi.com/v1/study/keywords/search?partialName=');
    expect(result).toEqual(mockResponse);
  });

  it('should handle fetch failure gracefully', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to fetch suggested keywords',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => fetchSuggestedKeywords('test')).rejects.toThrowError('Failed to fetch suggested keywords');
  });
});

describe('saveStudy', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a study', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(),
    });

    await saveStudy(mockStudy);

    expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
    expect(AuthService.authFetch).toHaveBeenCalledWith('https://mockapi.com/v1/study', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockStudy),
    });
  });
});

describe('deleteStudy', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delete a study', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(),
    });

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

    await expect(async () => deleteStudy(2)).rejects.toThrowError('Failed to delete study');
  });
});

describe('createStudy', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate a study', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
    });

    await generateStudy(5);

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

    await expect(async () => generateStudy(1)).rejects.toThrowError('Failed to generate a study');
  });

  it('should call notifyAlert when error has antaresErrorMessage', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to generate a study',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => generateStudy(1)).rejects.toThrowError('Failed to generate a study');

    expect(notifyAlert).toHaveBeenCalledWith({
      icon: 'close',
      message: 'Failed to generate a study',
      type: 'error',
      filledIcon: true,
    });
  });
});

describe('getStudyTrajectories', () => {
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

describe('duplicateStudy', () => {
  const mockStudyData = {
    name: 'BP_study',
    createdBy: 'unknown',
    keywords: ['tag1'],
    project: 'BP_REF_23',
    horizon: '2021-2022',
    trajectoryIds: [102, 123],
  };
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate a study', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
    });
    await duplicateStudy(mockStudyData);

    expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
    expect(AuthService.authFetch).toHaveBeenCalledWith('https://mockapi.com/v1/study/duplicate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockStudyData),
    });
  });
});

describe('getStudyById', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch study list', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockStudyResponse),
    });

    const result = await getStudyById(123);

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(`https://mockapi.com/v1/study/123`);
      expect(result).toEqual(mockStudyResponse);
    });
  });

  it('should handle fetch failure gracefully', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to study details',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => getStudyById(123)).rejects.toThrowError('Failed to study details');
  });
});

describe('updateStudy', () => {
  const mockStudyData = {
    name: 'BP_study',
    createdBy: 'unknown',
    keywords: ['tag1'],
    project: 'BP_REF_23',
    horizon: '2021-2022',
    trajectoryIds: [102, 123],
  } as StudyDTO;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should update a study', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
    });
    await updateStudy(mockStudyData, 123);

    expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
    expect(AuthService.authFetch).toHaveBeenCalledWith('https://mockapi.com/v1/study/123', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockStudyData),
    });
  });
});
