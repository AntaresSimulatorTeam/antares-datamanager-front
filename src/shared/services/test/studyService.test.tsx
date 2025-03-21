/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import {
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

vi.mock('@/shared/notification/notification');
vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));

describe('fetchSearchStudies', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch study list', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStudyResponse),
    });

    const result = await fetchSearchStudies('test', '124', 3, 10, { column: 'asc' });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/study/search?page=4&size=10&projectId=124&search=test&sortColumn=column&sortDirection=asc`,
        {},
      );
      expect(result).toEqual(mockStudyResponse);
    });
  });

  it('should handle fetch failure gracefully', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    });

    await expect(async () => fetchSearchStudies('test', '124', 3, 10, { column: 'asc' })).rejects.toThrowError(
      'Failed to fetch user studies',
    );
  });
});

describe('fetchSuggestedKeywords', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return suggested keywords', async () => {
    const mockResponse = ['keyword1', 'keyword2', 'keyword3'];
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchSuggestedKeywords('test');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('https://mockapi.com/v1/study/keywords/search?partialName=test', {});
    expect(result).toEqual(mockResponse);
  });

  it('should handle fetch failure gracefully', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    });

    await expect(async () => fetchSuggestedKeywords('test')).rejects.toThrowError('Failed to fetch suggested keywords');
  });
});

describe('saveStudy', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a study', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(),
    });

    await saveStudy(mockStudy);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('https://mockapi.com/v1/study', {
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

  it('should throw an error message', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      text: () => 'error',
    });

    const result = await saveStudy(mockStudy);
    expect(result).toEqual(undefined);
  });

  it('should handle fetch failure and display a notification', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Failed to create study'));

    await saveStudy(mockStudy);

    expect(notifyToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Failed to create study',
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
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(),
    });

    await deleteStudy(5);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('https://mockapi.com/v1/study/5', {
      method: 'DELETE',
    });
    expect(notifyToast).toHaveBeenCalledWith({
      type: 'success',
      message: 'Study deleted successfully',
    });
  });

  it('should throw an error message', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      text: () => 'error',
    });

    const result = await deleteStudy(2);
    expect(result).toEqual(undefined);
  });

  it('should handle delete failure and display a notification', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockRejectedValueOnce({ message: 'Failed to delete study' });

    await deleteStudy(2);

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
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockDbTrajectoryArray),
    });

    await getStudyTrajectories(1, TRAJECTORY_TYPE.AREA);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(`https://mockapi.com/v1/trajectory?studyId=1&trajectoryType=AREA`, {});
    });
  });

  it('should handle fetch failure gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      message: 'Failed to fetch trajectories',
    });

    await expect(async () => getStudyTrajectories(1, TRAJECTORY_TYPE.AREA)).rejects.toThrowError(
      'Failed to fetch trajectories',
    );
  });

  it('should handle exceptions during fetch', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    await expect(async () => getStudyTrajectories(1, TRAJECTORY_TYPE.AREA)).rejects.toThrowError('Network error');
  });
});
