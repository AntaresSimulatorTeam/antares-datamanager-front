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
  getNbMessagesFromTrajectoryType,
  getResTechnologyList,
  getStudyTrajectoriesWithWarnings,
  getTrajectoryDataByTypeAndId,
  isParamModulationRequired,
  linkTrajectoryToStudy,
  unlinkAllTrajectoriesFromStudy,
  unlinkMultipleTrajectoriesFromStudy,
  unlinkTrajectoryFromStudy,
  uploadTrajectory,
} from '@/shared/services/trajectoryService.ts';
import {
  mockDbTrajectory,
  mockFsTrajectoryAreaArray,
  mockFsTrajectorySTSArray,
  mockTrajectoryAreaData,
  mockTrajectoryTwo,
} from '@/mocks/data/tests/trajectory.mock.ts';
import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';
import { AuthService } from '@/shared/services/authService.ts';
import { mockWarningMessagesWithTwo } from '@/mocks/data/tests/warning.mock.ts';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { fetchWarningMessagesFromType } from '@/shared/services/warningService.ts';
import * as progressService from '@/shared/services/progressService.ts';
import { TRAJECTORY_THERMAL_PARAM_MODULATION } from '@/shared/const/apiEndPoint.ts';

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

  it('should fetch trajectories with AREA type from data base', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockDbTrajectory),
    });

    const result = await fetchTrajectoriesFromDB(TRAJECTORY_TYPE.AREA, '2023-2024');

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/db?trajectoryType=AREA&horizon=2023-2024&area=&technology=',
      );
      expect(result).toEqual(mockDbTrajectory);
    });
  });

  it('should fetch trajectories with THERMAL_CAPACITY and empty technology type from data base', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockDbTrajectory),
    });

    const result = await fetchTrajectoriesFromDB(TRAJECTORY_TYPE.THERMAL_CAPACITY, '2023-2024');

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/db?trajectoryType=THERMAL_CAPACITY&horizon=2023-2024&area=&technology=',
      );
      expect(result).toEqual(mockDbTrajectory);
    });
  });

  it('should fetch trajectories with THERMAL_CAPACITY and a technology type from data base', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockDbTrajectory),
    });

    const result = await fetchTrajectoriesFromDB(TRAJECTORY_TYPE.THERMAL_CAPACITY, '2023-2024', {
      area: 'FR',
      technology: 'Biomass',
    });

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/db?trajectoryType=THERMAL_CAPACITY&horizon=2023-2024&area=FR&technology=Biomass',
      );
      expect(result).toEqual(mockDbTrajectory);
    });
  });

  it('should fetch trajectories with THERMAL_CAPACITY type, an area, a technology and a search term from data base', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockDbTrajectory),
    });

    const result = await fetchTrajectoriesFromDB(TRAJECTORY_TYPE.THERMAL_CAPACITY, '2023-2024', {
      area: 'FR',
      technology: 'Biomass',
      fileNameContains: 'traj',
    });

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/db?trajectoryType=THERMAL_CAPACITY&horizon=2023-2024&area=FR&technology=Biomass&fileNameContains=traj',
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

describe('getResTechnologyList', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns a list of technology names when API responds with label fields', async () => {
    const results = [
      { id: 1, label: 'Wind offshore', code: 'wind_offshore' },
      { id: 1, label: 'Solar PV', code: 'solar_pv' },
    ];
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(results),
    });

    const result = await getResTechnologyList();

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith('https://mockapi.com/v1/trajectory/res-types');
      expect(result).toEqual(results);
    });
  });

  it('throws a friendly error when the API call fails', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to fetch res types',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => getResTechnologyList()).rejects.toThrowError('Failed to fetch res types');
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
      expect(AuthService.authFetch).toHaveBeenCalledWith(`https://mockapi.com/v1/trajectory/fs?trajectoryType=AREA`);
      expect(result).toEqual(mockFsTrajectoryAreaArray);
    });
  });

  it('should fetch trajectories with STS type from file system', async () => {
    vi.mocked(AuthService.authFetch, { partial: true }).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockFsTrajectorySTSArray),
    });

    await fetchTrajectoriesFromFS(TRAJECTORY_TYPE.STS, 'battery');

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/fs?trajectoryType=STS&technology=battery`,
      );
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

    await expect(async () => getStudyTrajectoriesWithWarnings(5, TRAJECTORY_TYPE.LINK)).rejects.toThrowError(
      'Failed to fetch warning message',
    );
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

  it('should import AREA trajectory into data base', async () => {
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

  it('should import LOAD trajectory into data base', async () => {
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

  it('should import THERMAL_CAPACITY trajectory without technology into data base', async () => {
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

  it('should import THERMAL_CAPACITY trajectory with technology into data base', async () => {
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

  it('should import TRAJECTORY_THERMAL_COMMON_PARAMETER_IMPORT trajectory into data base', async () => {
    await uploadTrajectory(
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER,
      'common_param_BP_23_v6',
      '2025-2026',
      2,
      'FR',
      onProgress,
    );

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/thermal-common-parameter?trajectoryToUse=common_param_BP_23_v6&horizon=2025-2026&studyId=2`,
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import THERMAL_TECHNICAL_SPECIFIC_PARAMETER trajectory into data base', async () => {
    await uploadTrajectory(
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
      'specific_param_BP_23',
      '2030-2031',
      25,
      'Specific',
      onProgress,
      false,
      'FR',
    );

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/thermal-specific-parameter?area=FR&trajectoryToUse=specific_param_BP_23&horizon=2030-2031&studyId=25`,
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import TRAJECTORY_THERMAL_MODULATION_PARAMETER_IMPORT trajectory into data base', async () => {
    await uploadTrajectory(
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER,
      'param',
      '2030-2031',
      25,
      'Specific',
      onProgress,
      false,
      'FR',
    );

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/thermal-modulation-parameter?area=FR&trajectoryToUse=param&horizon=2030-2031&studyId=25`,
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import THERMAL_ECONOMIC_COST_PARAMETER trajectory into data base', async () => {
    await uploadTrajectory(
      TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER,
      'costs',
      '2030-2031',
      25,
      undefined,
      onProgress,
    );

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/thermal-economic-costs?trajectoryToUse=costs&horizon=2030-2031&studyId=25`,
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import THERMAL_ECONOMIC_PARAMETER trajectory into data base', async () => {
    await uploadTrajectory(
      TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER,
      'economic',
      '2030-2031',
      30,
      undefined,
      onProgress,
    );

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/thermal-economic-parameter?trajectoryToUse=economic&horizon=2030-2031&studyId=30`,
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import DSR trajectory into data base', async () => {
    await uploadTrajectory(TRAJECTORY_TYPE.DSR, 'param', '2030-2031', 25, 'FR', onProgress, false);

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/dsr-cluster?area=FR&trajectoryToUse=param&horizon=2030-2031&studyId=25&isCivilYear=false`,
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import DSR_CAPACITY_MODULATION trajectory into data base', async () => {
    await uploadTrajectory(TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION, 'param', '2030-2031', 25, '', onProgress);

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        `https://mockapi.com/v1/trajectory/dsr-capacity-modulation?trajectoryToUse=param&horizon=2030-2031&studyId=25`,
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
    ).rejects.toThrowError('Failed to upload trajectory area_BP_23_v6');
  });

  it('should import STS trajectory into data base', async () => {
    await uploadTrajectory(
      TRAJECTORY_TYPE.STS,
      'cluster_battery_PEMMEDB25',
      '2030-2031',
      87,
      'AT',
      onProgress,
      false,
      'battery',
    );

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/st-storage?area=AT&technology=battery&trajectoryToUse=cluster_battery_PEMMEDB25&horizon=2030-2031&studyId=87&isCivilYear=false',
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import MISC Installed power trajectory into data base', async () => {
    await uploadTrajectory(
      TRAJECTORY_TYPE.MISC_CAPACITY,
      'cluster_battery_PEMMEDB25',
      '2030-2031',
      87,
      'AT',
      onProgress,
    );

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/installed-misc?area=AT&trajectoryToUse=cluster_battery_PEMMEDB25&horizon=2030-2031&studyId=87&isCivilYear=false',
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import MISC Load factor trajectory into data base', async () => {
    await uploadTrajectory(TRAJECTORY_TYPE.MISC_LOAD, 'cluster_battery_PEMMEDB25', '2030-2031', 87, 'AT', onProgress);

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/load-factor-misc?area=AT&trajectoryToUse=cluster_battery_PEMMEDB25&horizon=2030-2031&studyId=87',
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import RES CAPACITY Installed power trajectory into data base', async () => {
    await uploadTrajectory(TRAJECTORY_TYPE.RES_CAPACITY, 'installedRES_PEMMEDB25', '2030-2031', 87, 'AT', onProgress);

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/installed-power-res?area=AT&technology=&trajectoryToUse=installedRES_PEMMEDB25&horizon=2030-2031&studyId=87&isCivilYear=false',
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import RES CAPACITY Installed power trajectory into data base', async () => {
    await uploadTrajectory(
      TRAJECTORY_TYPE.RES_CAPACITY,
      'installedRES_PEMMEDB25',
      '2030-2031',
      87,
      'AT',
      onProgress,
      false,
      'wind_offshore',
    );

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/installed-power-res?area=AT&technology=wind_offshore&trajectoryToUse=installedRES_PEMMEDB25&horizon=2030-2031&studyId=87&isCivilYear=false',
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import RES Load factor trajectory into data base', async () => {
    await uploadTrajectory(
      TRAJECTORY_TYPE.RES_LOAD,
      'PEMMEDB25',
      '2030-2031',
      87,
      'AT',
      onProgress,
      false,
      'Wind Offshore',
    );

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/load-factor-res?area=AT&technology=wind%20offshore&trajectoryToUse=PEMMEDB25&horizon=2030-2031&studyId=87',
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import RES Zonal distribution trajectory into data base', async () => {
    await uploadTrajectory(
      TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION,
      'repartition_zonal_PEMMEDB25',
      '2030-2031',
      87,
      'AT',
      onProgress,
      false,
    );

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/zonal-distribution-res?area=AT&technology=&trajectoryToUse=repartition_zonal_PEMMEDB25&horizon=2030-2031&studyId=87&isCivilYear=false',
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import RES Technology distribution trajectory with technology into data base', async () => {
    await uploadTrajectory(
      TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION,
      'repartition_techno_PEMMEDB25',
      '2030-2031',
      87,
      'AT',
      onProgress,
      false,
      'Wind Offshore',
    );

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/technology-distribution-res?area=AT&technology=wind_offshore&trajectoryToUse=repartition_techno_PEMMEDB25&horizon=2030-2031&studyId=87&isCivilYear=false',
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import HYDRO Series trajectory into data base', async () => {
    await uploadTrajectory(TRAJECTORY_TYPE.HYDRO_SERIES, 'PEMMEDB25', '2030-2031', 87, 'AT', onProgress, false);

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/hydro-series?area=AT&trajectoryToUse=PEMMEDB25&horizon=2030-2031&studyId=87&isCivilYear=false',
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import HYDRO Technical Parameters trajectory into data base', async () => {
    await uploadTrajectory(
      TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS,
      'PEMMEDB25',
      '2030-2031',
      87,
      'AT',
      onProgress,
      false,
    );

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/hydro-technical-parameters?area=AT&trajectoryToUse=PEMMEDB25&horizon=2030-2031&studyId=87&isCivilYear=false',
        requestOptions,
        onProgress,
      );
    });
  });

  it('should import RES Technology distribution trajectory without technology into data base', async () => {
    await uploadTrajectory(
      TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION,
      'repartition_techno_PEMMEDB25',
      '2030-2031',
      87,
      'AT',
      onProgress,
      false,
    );

    await waitFor(() => {
      expect(progressService.fetchWithProgress).toHaveBeenCalledTimes(1);
      expect(progressService.fetchWithProgress).toHaveBeenCalledWith(
        'https://mockapi.com/v1/trajectory/technology-distribution-res?area=AT&trajectoryToUse=repartition_techno_PEMMEDB25&horizon=2030-2031&studyId=87&isCivilYear=false',
        requestOptions,
        onProgress,
      );
    });
  });
});

describe('isParamModulationRequired', () => {
  const studyId = 123;
  const horizon = '2025';

  it('should return true when API responds with true', async () => {
    // Mock de la réponse
    const mockResponse = {
      json: vi.fn().mockResolvedValue(true),
    } as unknown as Response;

    vi.spyOn(AuthService, 'authFetch').mockResolvedValue(mockResponse);

    const result = await isParamModulationRequired(studyId, horizon);

    expect(result).toBe(true);
    expect(AuthService.authFetch).toHaveBeenCalledWith(
      `${TRAJECTORY_THERMAL_PARAM_MODULATION}?horizon=${horizon}&studyId=${studyId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );
  });

  it('should return false when API responds with false', async () => {
    const mockResponse = {
      json: vi.fn().mockResolvedValue(false),
    } as unknown as Response;

    vi.spyOn(AuthService, 'authFetch').mockResolvedValue(mockResponse);

    const result = await isParamModulationRequired(studyId, horizon);

    expect(result).toBe(false);
  });

  it('should throw an error when API fails', async () => {
    const backendError = { antaresErrorMessage: 'API failed' };
    vi.spyOn(AuthService, 'authFetch').mockRejectedValue(backendError);

    await expect(isParamModulationRequired(studyId, horizon)).rejects.toThrow('API failed');
  });
});
