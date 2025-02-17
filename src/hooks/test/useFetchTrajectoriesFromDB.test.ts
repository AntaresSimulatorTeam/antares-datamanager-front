/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useFetchTrajectoriesFromDB } from '@/hooks/useFetchTrajectoriesFromDB.ts';

const mockFetch = vi.fn();
global.fetch = mockFetch;
vi.mock('@/shared/notification/notification');
vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));

const mockResponseTrajectoriesDB = [
  {
    id: 1,
    trajectory_name: 'area_PB_2024',
    type: TRAJECTORY_TYPE.AREA,
    version: 3,
    user_name: 'mouad',
    creation_date: '2024-07-22 15:13:56.860045' as unknown as Date,
  },
  {
    id: 2,
    trajectory_name: 'area_PB_2026',
    type: TRAJECTORY_TYPE.AREA,
    version: 3,
    user_name: 'mouad',
    creation_date: '2026-08-22 15:13:56.860045' as unknown as Date,
  },
];

describe('useFetchTrajectoriesFromDB', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockResponseTrajectoriesDB),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetches trajectories from data base on mount', async () => {
    const { result } = renderHook(() => useFetchTrajectoriesFromDB(TRAJECTORY_TYPE.AREA, '2023_2024'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/db?trajectoryType=AREA&horizon=2023_2024&fileNameStartsWith=',
        {},
      );
      expect(result.current.trajectories).toEqual(mockResponseTrajectoriesDB);
      expect(result.current.trajectories).toHaveLength(2);
    });
  });

  it('should not call fetchTrajectoriesFromDB api if horizon is an empty string', async () => {
    const { result } = renderHook(() => useFetchTrajectoriesFromDB(TRAJECTORY_TYPE.AREA, ''));

    await waitFor(() => {
      expect(global.fetch).to.not.toHaveBeenCalled();
      expect(result.current.trajectories).toBeNull();
    });
  });
});
