/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import {
  fetchTrajectoriesFromDB,
  fetchTrajectoriesFromFS,
  getStudyTrajectories,
  linkTrajectoryToStudy,
  unlinkTrajectoryFromStudy,
  uploadTrajectory,
} from '@/shared/services/trajectoryService.ts';
import {
  mockDbTrajectory,
  mockDbTrajectoryArray,
  mockFsTrajectoryArray,
} from '@/shared/services/test/mocks/trajectoryMock.tsx';

vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));

describe('fetchTrajectoriesFromDB', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch trajectories with area type from data base', async () => {
    //Successful fetch response mock
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockDbTrajectory),
    });

    const result = await fetchTrajectoriesFromDB(TRAJECTORY_TYPE.AREA, '2023-2024');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/db?trajectoryType=AREA&horizon=2023-2024&fileNameContains=`,
        {},
      );
      expect(result).toEqual(mockDbTrajectory);
    });
  });

  it('should handle fetch failure gracefully', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    });

    await expect(async () => fetchTrajectoriesFromDB(TRAJECTORY_TYPE.AREA, '2023-2024')).rejects.toThrowError(
      'Failed to fetch trajectories from data base',
    );
  });

  it('should handle exceptions during fetch', async () => {
    //Fetch throwing an error mock
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    await expect(async () => fetchTrajectoriesFromDB(TRAJECTORY_TYPE.AREA, '2023-2024')).rejects.toThrowError(
      'Network error',
    );
  });
});

describe('fetchTrajectoriesFromFS', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch trajectories with area type from file system', async () => {
    //Successful fetch response mock
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockFsTrajectoryArray),
    });

    const result = await fetchTrajectoriesFromFS(TRAJECTORY_TYPE.AREA);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/fs?trajectoryType=AREA&thermalCapacityArea=`,
        {},
      );
      expect(result).toEqual(mockFsTrajectoryArray);
    });
  });

  it('should handle fetch failure gracefully', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    });

    await expect(async () => fetchTrajectoriesFromFS(TRAJECTORY_TYPE.AREA)).rejects.toThrowError(
      'Failed to fetch trajectories from file system',
    );
  });

  it('should handle exceptions during fetch', async () => {
    //Fetch throwing an error mock
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    await expect(async () => fetchTrajectoriesFromFS(TRAJECTORY_TYPE.AREA)).rejects.toThrowError('Network error');
  });
});

describe('uploadTrajectory', () => {
  const onProgress = vi.fn();
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should add trajectory to data base', async () => {
    //Successful fetch response mock
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockDbTrajectory),
    });

    await uploadTrajectory(TRAJECTORY_TYPE.AREA, 'area_BP_23_v6', '2025-2026', 2, onProgress);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory?trajectoryType=AREA&trajectoryToUse=area_BP_23_v6&horizon=2025-2026&studyId=2`,
        requestOptions,
      );
    });
  });

  it('should handle fetch failure gracefully', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    });

    await expect(async () =>
      uploadTrajectory(TRAJECTORY_TYPE.AREA, 'area_BP_23_v6', '2025-2026', 2, onProgress),
    ).rejects.toThrowError('Failed to import trajectory into data base');
  });

  it('should handle exceptions during fetch', async () => {
    //Fetch throwing an error mock
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    await expect(async () =>
      uploadTrajectory(TRAJECTORY_TYPE.AREA, 'area_BP_23_v6', '2025-2026', 2, onProgress),
    ).rejects.toThrowError('Network error');
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
    // Failed fetch response moc
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      message: 'Failed to fetch trajectories',
    });

    await expect(async () => getStudyTrajectories(1, TRAJECTORY_TYPE.AREA)).rejects.toThrowError(
      'Failed to fetch trajectories',
    );
  });

  it('should handle exceptions during fetch', async () => {
    //Fetch throwing an error mock
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    await expect(async () => getStudyTrajectories(1, TRAJECTORY_TYPE.AREA)).rejects.toThrowError('Network error');
  });
});

describe('linkTrajectoryToStudy', () => {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should link a trajectory to a study', async () => {
    //Successful fetch response mock
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockDbTrajectory),
    });

    await linkTrajectoryToStudy(TRAJECTORY_TYPE.AREA, 100, 2);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/link?type=AREA&trajectoryId=100&studyId=2`,
        requestOptions,
      );
    });
  });

  it('should handle fetch failure gracefully', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      message: 'Failed to link a trajectory to a study',
    });

    await expect(async () => linkTrajectoryToStudy(TRAJECTORY_TYPE.AREA, 100, 2)).rejects.toThrowError(
      'Failed to link a trajectory to a study',
    );
  });

  it('should handle exceptions during fetch', async () => {
    //Fetch throwing an error mock
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    await expect(async () => linkTrajectoryToStudy(TRAJECTORY_TYPE.AREA, 100, 2)).rejects.toThrowError('Network error');
  });
});

describe('unlinkTrajectoryFromStudy', () => {
  const requestOptions = {
    method: 'DELETE',
  };

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.restoreAllMocks();
  });

  it('should unlink a trajectory from a study', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
    });

    await unlinkTrajectoryFromStudy(100, 2);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/link?trajectoryId=100&studyId=2',
        requestOptions,
      );
    });
  });

  it('should handle exceptions during fetch', async () => {
    //Fetch throwing an error mock
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    await expect(async () => unlinkTrajectoryFromStudy(100, 2)).rejects.toThrowError('Network error');
  });
});
