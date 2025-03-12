/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  TRAJECTORY_DATA_BASE_ENDPOINT,
  TRAJECTORY_ENDPOINT,
  TRAJECTORY_FILE_SYSTEM_ENDPOINT,
  TRAJECTORY_LINK_TO_STUDY_ENDPOINT,
} from '@/shared/const/apiEndPoint.ts';
import { DbTrajectory, FsTrajectory } from '@/shared/types';
import { AuthService } from '@/shared/services/authService.ts';
import { fetchWithProgress } from '@/shared/services/progressService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

/**
 * Retrieve a list of trajectories by type and horizon from database
 *
 * @param {TRAJECTORY_TYPE} trajectoryType - Partial name of a study
 * @param {string} horizon - Horizon value (ex: 2020-2021)
 * @param {string | undefined} fileName - Autocompletion - filter trajectories by file name
 * @returns {Promise<DbTrajectory[]>} - Promise object that represents a list of trajectories
 */
export const fetchTrajectoriesFromDB = async (
  trajectoryType: string,
  horizon: string,
  fileName?: string,
): Promise<DbTrajectory[]> => {
  const urlApi = `${TRAJECTORY_DATA_BASE_ENDPOINT}?trajectoryType=${trajectoryType}&horizon=${horizon}&fileNameContains=${fileName ?? ''}`;
  const response = await AuthService.authFetch(urlApi);
  if (!response.ok) {
    throw new Error('Failed to fetch trajectories from data base');
  }
  return (await response.json()) as DbTrajectory[];
};

/**
 * Retrieve a list of trajectories by type and thermal capacity area from file system
 *
 * @param {TRAJECTORY_TYPE} trajectoryType - Partial name of a study
 * @param {string | undefined} thermalCapacityArea - To use just in thermal capacity case
 * @returns {Promise<FsTrajectory[]>} - Promise object that represents a list of trajectories
 */
export const fetchTrajectoriesFromFS = async (
  trajectoryType: string,
  thermalCapacityArea?: string | undefined,
): Promise<FsTrajectory[]> => {
  const urlApi = `${TRAJECTORY_FILE_SYSTEM_ENDPOINT}?trajectoryType=${trajectoryType}&thermalCapacityArea=${thermalCapacityArea ?? ''}`;
  const response = await AuthService.authFetch(urlApi);
  if (!response.ok) {
    throw new Error('Failed to fetch trajectories from file system');
  }
  return (await response.json()) as FsTrajectory[];
};

/**
 * Import a trajectory file into database
 *
 * @param {TRAJECTORY_TYPE} trajectoryType - Trajectory type
 * @param {string} trajectoryName - Name of trajectory to add to data base
 * @param {string} horizon - Trajectory horizon
 * @param {(progress: number) => void} onProgress - Set progress value
 * @returns {Promise<DbTrajectory>} - Promise object that represents a trajectory inserted into database
 */
export const addTrajectory = async (
  trajectoryType: string,
  trajectoryName: string,
  horizon: string,
  onProgress: (progress: number) => void,
): Promise<DbTrajectory> => {
  const urlApi = `${TRAJECTORY_ENDPOINT}?trajectoryType=${trajectoryType}&trajectoryToUse=${trajectoryName}&horizon=${horizon}`;
  const [_, response] = await fetchWithProgress(
    urlApi,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    onProgress,
  );

  if (!(response as Response).ok) {
    throw new Error('Failed to import trajectory into data base');
  } else {
    return (await (response as Response).json()) as DbTrajectory;
  }
};

/**
 * Fetch trajectories linked to a study
 * @param {number} studyId - Study id
 * @param {TRAJECTORY_TYPE} trajectoryType - Trajectory type
 *
 * @return {Promise<DbTrajectory[] | Error>} Array of trajectories (data base trajectories)
 */

export const getStudyTrajectories = async (
  studyId: number,
  trajectoryType: TRAJECTORY_TYPE,
): Promise<DbTrajectory[] | Error> => {
  const urlApi = `${TRAJECTORY_ENDPOINT}?studyId=${studyId}&trajectoryType=${trajectoryType}`;

  const response = await AuthService.authFetch(urlApi);
  if (!response.ok) {
    throw new Error('Failed to fetch trajectories linked to studies');
  }

  return (await response.json()) as DbTrajectory[];
};

/**
 * Linked a trajectory to study
 * @param {TRAJECTORY_TYPE} type - Trajectory type
 * @param {number} trajectoryId - Trajectory id
 * @param {number} studyId - Study id
 *
 * @return {Promise<DbTrajectory | Error>} - Trajectory linked to a study
 */

export const linkTrajectoryToStudy = async (
  type: TRAJECTORY_TYPE,
  trajectoryId: number,
  studyId: number,
): Promise<DbTrajectory | Error> => {
  const urlApi = `${TRAJECTORY_LINK_TO_STUDY_ENDPOINT}?type=${type}&trajectoryId=${trajectoryId}&studyId=${studyId}`;
  const response = await AuthService.authFetch(urlApi, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`${(response as unknown as Error).message}`);
  }

  return (await response.json()) as DbTrajectory;
};

/**
 * Delete a link between a trajectory and a study
 *
 * @param {number} trajectoryId - Trajectory id
 * @param {number} studyId - Study id
 */
export const unlinkTrajectoryFromStudy = async (trajectoryId: number, studyId: number) => {
  const urlApi = `${TRAJECTORY_LINK_TO_STUDY_ENDPOINT}?trajectoryId=${trajectoryId}&studyId=${studyId}`;
  const response = await AuthService.authFetch(urlApi, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`${(response as unknown as Error).message}`);
  }
};
