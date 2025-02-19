/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import {
  addTrajectory,
  fetchTrajectoriesFromDB,
  fetchTrajectoriesFromFS,
} from '@/shared/services/trajectoryService.ts';
import { DbTrajectory } from '@/shared/types';

vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));

const mockResponseDB: DbTrajectory = {
  id: 1,
  trajectoryName: 'area_BP_23_v6',
  type: TRAJECTORY_TYPE.AREA,
  version: 6,
  userName: 'mouad',
  creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
};

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
      json: async () => Promise.resolve(mockResponseDB),
    });

    const result = await fetchTrajectoriesFromDB(TRAJECTORY_TYPE.AREA, '2023-2024');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/db?trajectoryType=AREA&horizon=2023-2024&fileNameStartsWith=`,
        {},
      );
      expect(result).toEqual(mockResponseDB);
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
  const mockResponseFS = {
    trajectoryName: 'area_BP_23_v6',
    type: TRAJECTORY_TYPE.AREA,
    lastModifiedDate: '2024-07-22 15:13:56.860045',
  };

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
      json: async () => Promise.resolve(mockResponseFS),
    });

    const result = await fetchTrajectoriesFromFS(TRAJECTORY_TYPE.AREA);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/fs?trajectoryType=AREA&thermalCapacityArea=`,
        {},
      );
      expect(result).toEqual(mockResponseFS);
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

describe('addTrajectory', () => {
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
      json: async () => Promise.resolve(mockResponseDB),
    });

    await addTrajectory(TRAJECTORY_TYPE.AREA, 'area_BP_23_v6', '2025-2026', onProgress);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory?trajectoryType=AREA&trajectoryToUse=area_BP_23_v6&horizon=2025-2026`,
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
      addTrajectory(TRAJECTORY_TYPE.AREA, 'area_BP_23_v6', '2025-2026', onProgress),
    ).rejects.toThrowError('Failed to import trajectory into data base');
  });

  it('should handle exceptions during fetch', async () => {
    //Fetch throwing an error mock
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    await expect(async () =>
      addTrajectory(TRAJECTORY_TYPE.AREA, 'area_BP_23_v6', '2025-2026', onProgress),
    ).rejects.toThrowError('Network error');
  });
});
