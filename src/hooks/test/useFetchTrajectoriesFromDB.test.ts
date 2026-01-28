/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useFetchTrajectoriesFromDB } from '@/hooks/useFetchTrajectoriesFromDB.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type';
import { mockDbTrajectoryArray } from '@/mocks/data/tests/trajectory.mock.ts';

const mockFetch = vi.fn();
global.fetch = mockFetch;
vi.mock('@/shared/notification/notification');
vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));

describe('useFetchTrajectoriesFromDB', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockDbTrajectoryArray),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetches trajectories from data base on mount', async () => {
    const { result } = renderHook(() =>
      useFetchTrajectoriesFromDB(TRAJECTORY_TYPE.AREA, '2023_2024', StudyStatus.IN_PROGRESS),
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/db?trajectoryType=AREA&horizon=2023_2024&area=&technology=',
        {},
      );
      expect(result.current.trajectories).toEqual(mockDbTrajectoryArray);
      expect(result.current.trajectories).toHaveLength(2);
    });
  });

  it('should not call fetchTrajectoriesFromDB api if horizon is an empty string', async () => {
    const { result } = renderHook(() => useFetchTrajectoriesFromDB(TRAJECTORY_TYPE.AREA, '', StudyStatus.IN_PROGRESS));

    await waitFor(() => {
      expect(global.fetch).to.not.toHaveBeenCalled();
      expect(result.current.trajectories).toBeNull();
    });
  });
});
