/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { expect, Mock, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import {
  fetchTrajectoriesFromDB,
  fetchTrajectoriesFromFS,
  getDefaultLoadHypothesis,
  getNbMessagesFromTrajectoryType,
  getStudyTrajectoriesWithWarnings,
  getTrajectoryDataByTypeAndId,
  linkTrajectoryToStudy,
  unlinkAllTrajectoriesFromStudy,
  unlinkMultipleTrajectoriesFromStudy,
  unlinkTrajectoryFromStudy,
  uploadTrajectory,
} from '@/shared/services/trajectoryService.ts';
import {
  mockDbTrajectory,
  mockFsTrajectoryAreaArray,
  mockTrajectoryAreaData,
  mockTrajectoryTwo,
} from '@/mocks/data/tests/trajectory.mock.ts';
import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';
import { AuthService } from '@/shared/services/authService.ts';
import { mockWarningMessagesWithTwo } from '@/mocks/data/tests/warning.mock.ts';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { fetchWarningMessagesFromType } from '@/shared/services/warningService.ts';
import * as progressService from '@/shared/services/progressService.ts';

vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));
vi.mock('@/shared/services/authService');
vi.mock('@/shared/services/progressService');
vi.mock('@/shared/services/studyService', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    getStudyTrajectories: vi.fn().mockImplementation(() => Promise.resolve(mockTrajectoryTwo)),
  };
});
vi.mock('@/shared/services/warningService', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    fetchWarningMessagesFromType: vi.fn().mockImplementation(() => Promise.resolve(mockWarningMessagesWithTwo)),
  };
});

describe('fetchTrajectoriesFromDB', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch trajectories with area type from data base', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockDbTrajectory),
    });

    const result = await fetchTrajectoriesFromDB(TRAJECTORY_TYPE.AREA, '2023-2024');

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/db?trajectoryType=AREA&horizon=2023-2024&fileNameContains=&loadArea=`,
      );
      expect(result).toEqual(mockDbTrajectory);
    });
  });

  it('should handle fetch failure gracefully', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to fetch trajectories from data base',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => fetchTrajectoriesFromDB(TRAJECTORY_TYPE.AREA, '2023-2024')).rejects.toThrowError(
      'Failed to fetch trajectories from data base',
    );
  });
});

describe('fetchTrajectoriesFromFS', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch trajectories with area type from file system', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockFsTrajectoryAreaArray),
    });

    const result = await fetchTrajectoriesFromFS(TRAJECTORY_TYPE.AREA);

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/fs?trajectoryType=AREA&zone=&fileNameContains=`,
      );
      expect(result).toEqual(mockFsTrajectoryAreaArray);
    });
  });

  it('should handle fetch failure gracefully', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to fetch trajectories from file system',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => fetchTrajectoriesFromFS(TRAJECTORY_TYPE.AREA)).rejects.toThrowError(
      'Failed to fetch trajectories from file system',
    );
  });
});

describe('linkTrajectoryToStudy', () => {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should link a trajectory to a study', async () => {
    // Mock the first call to link the trajectory
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockDbTrajectory),
    });

    const result = await linkTrajectoryToStudy(TRAJECTORY_TYPE.AREA, 100, 2);

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/attach?type=AREA&trajectoryId=100&studyId=2`,
        requestOptions,
      );
      expect(result).toEqual(mockDbTrajectory);
    });
  });

  it('should handle link failure gracefully', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to link trajectory to study',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => linkTrajectoryToStudy(TRAJECTORY_TYPE.AREA, 100, 2)).rejects.toThrowError(
      'Failed to link trajectory to study',
    );
  });
});

describe('unlinkTrajectoryFromStudy', () => {
  const requestOptions = {
    method: 'DELETE',
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should unlink a trajectory from a study', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
    });

    await unlinkTrajectoryFromStudy(100, 2);

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/detach?trajectoryId=100&studyId=2',
        requestOptions,
      );
    });
  });

  it('should handle exceptions during unlink', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to unlink trajectory to study',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => unlinkTrajectoryFromStudy(100, 2)).rejects.toThrowError(
      'Failed to unlink trajectory to study',
    );
  });
});

describe('unlinkAllTrajectoriesFromStudy', () => {
  const requestOptions = { method: 'DELETE' };
  const studyId = 42;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should unlink all trajectories from a study', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({ ok: true });

    await unlinkAllTrajectoriesFromStudy(studyId);

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/detach/all?studyId=${studyId}`,
        requestOptions,
      );
    });
  });

  it('should handle exception during unlink all', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to unlink all trajectories',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => unlinkAllTrajectoriesFromStudy(studyId)).rejects.toThrowError(
      'Failed to unlink all trajectories',
    );
  });
});

describe('unlinkMultipleTrajectoriesFromStudy', () => {
  const requestOptions = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '[1,8,45]' };
  const studyId = 42;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should unlink all trajectories from a study', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({ ok: true });

    await unlinkMultipleTrajectoriesFromStudy(studyId, [1, 8, 45]);

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/detach/batch?studyId=${studyId}`,
        requestOptions,
      );
    });
  });

  it('should handle exception during unlink all', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Batch detach of trajectories [0] failed',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => unlinkAllTrajectoriesFromStudy(studyId)).rejects.toThrowError(
      'Batch detach of trajectories [0] failed',
    );
  });
});

describe('getTrajectoryDataByTypeAndId', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch trajectory data', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockTrajectoryAreaData),
    });

    const result = await getTrajectoryDataByTypeAndId(TRAJECTORY_TYPE.AREA, 2);

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/trajectoryData?trajectoryType=AREA&trajectoryId=2',
      );
      expect(result).toEqual(mockTrajectoryAreaData);
    });
  });

  it('should throw error when data fetching failed', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to fetch data trajectory',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => getTrajectoryDataByTypeAndId(TRAJECTORY_TYPE.LINK, 5)).rejects.toThrowError(
      'Failed to fetch data trajectory',
    );
  });
});

describe('getNbMessagesFromTrajectoryType', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch trajectory data', async () => {
    const nbMessageByType = { AREA: 1, LINK: 9 };
    const studyId = 2;
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(nbMessageByType),
    });

    const result = await getNbMessagesFromTrajectoryType(studyId);

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith('https://mockapi.com/v1/trajectory/count/warning/2');
      expect(result).toEqual(nbMessageByType);
    });
  });

  it('should throw error when data fetching failed', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to count warning',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => getNbMessagesFromTrajectoryType(5)).rejects.toThrowError('Failed to count warning');
  });
});

describe('getStudyTrajectoriesWithWarnings', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch trajectories study and warning message from trajectory type', async () => {
    const trajectoryType = TRAJECTORY_TYPE.AREA;
    const studyId = 2;

    const result = await getStudyTrajectoriesWithWarnings(studyId, trajectoryType);

    await waitFor(() => {
      expect(getStudyTrajectories).toHaveBeenCalledWith(2, 'AREA');
      expect(fetchWarningMessagesFromType).toHaveBeenCalledWith('AREA', 2);
      expect(result).toEqual({ trajectories: mockTrajectoryTwo, warningMessages: mockWarningMessagesWithTwo });
    });
  });

  it('should throw error when data fetching failed', async () => {
    vi.mocked(getStudyTrajectories).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to fetch warning message',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => getStudyTrajectoriesWithWarnings(5)).rejects.toThrowError(
      'Failed to fetch warning message',
    );
  });
});

describe('getDefaultLoadHypothesis', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch default hypothesis', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve({ name: 'FR' }),
    });

    const result = await getDefaultLoadHypothesis();

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith('https://mockapi.com/v1/default_config/load');
      expect(result).toEqual({ name: 'FR' });
    });
  });

  it('should throw error when data fetching failed', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to fetch default hypothesis',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => getDefaultLoadHypothesis()).rejects.toThrowError('Failed to fetch default hypothesis');
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
  vi.mocked(progressService.fetchWithProgress, { partial: true }).mockResolvedValue({
    ok: true,
    json: async () => Promise.resolve(mockDbTrajectory),
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should import trajectory to data base', async () => {
    await uploadTrajectory(TRAJECTORY_TYPE.AREA, 'area_BP_23_v6', '2025-2026', 2, 'FR', onProgress);

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory?trajectoryType=AREA&trajectoryToUse=area_BP_23_v6&horizon=2025-2026&studyId=2`,
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import trajectory to data base', async () => {
    await uploadTrajectory(TRAJECTORY_TYPE.LOAD, 'area_BP_23_v6', '2025-2026', 2, 'FR', onProgress);

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/load?area=FR&trajectoryToUse=area_BP_23_v6&horizon=2025-2026&studyId=2`,
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import trajectory without technology into data base', async () => {
    await uploadTrajectory(TRAJECTORY_TYPE.THERMAL_CAPACITY, 'area_BP_23_v6', '2025-2026', 2, 'FR', onProgress, true);

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/thermal-capacity?area=FR&trajectoryToUse=area_BP_23_v6&horizon=2025-2026&studyId=2&isCivilYear=true&technology=`,
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import trajectory with technology into data base', async () => {
    await uploadTrajectory(
      TRAJECTORY_TYPE.THERMAL_CAPACITY,
      'area_BP_23_v6',
      '2025-2026',
      2,
      'FR',
      onProgress,
      true,
      'Nuclear',
    );

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/thermal-capacity?area=FR&trajectoryToUse=area_BP_23_v6&horizon=2025-2026&studyId=2&isCivilYear=true&technology=Nuclear`,
        requestOptions,
        onProgress,
      );
    });
  });

  it('should handle fetch failure gracefully', async () => {
    vi.mocked(progressService.fetchWithProgress).mockRejectedValueOnce({
      message: 'Failed to import trajectory to data base',
    });

    await expect(async () =>
      uploadTrajectory(TRAJECTORY_TYPE.AREA, 'area_BP_23_v6', '2025-2026', 2, 'FR', onProgress),
    ).rejects.toThrowError('Failed to import trajectory to data base');
  });
});
