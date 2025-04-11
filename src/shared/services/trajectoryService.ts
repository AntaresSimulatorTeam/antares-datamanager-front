/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  TRAJECTORY_DATA_BASE_ENDPOINT,
  TRAJECTORY_DATA_FILE_ENDPOINT,
  TRAJECTORY_ENDPOINT,
  TRAJECTORY_FILE_SYSTEM_ENDPOINT,
  TRAJECTORY_LINK_TO_STUDY_ENDPOINT,
} from '@/shared/const/apiEndPoint.ts';
import { DbTrajectory, FsTrajectory, TRAJECTORY_DATA_TYPE, Types } from '@/shared/types';
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
 * @param {string | undefined} searchTerm - Autocompletion - filter trajectories by file name
 * @returns {Promise<FsTrajectory[]>} - Promise object that represents a list of trajectories
 */
export const fetchTrajectoriesFromFS = async (
  trajectoryType: string,
  searchTerm?: string | undefined,
  thermalCapacityArea?: string | undefined,
): Promise<FsTrajectory[]> => {
  const queryString = new URLSearchParams({
    trajectoryType: trajectoryType ?? '',
    thermalCapacityArea: thermalCapacityArea ?? '',
    fileNameContains: searchTerm ?? '',
  }).toString();

  const urlApi = `${TRAJECTORY_FILE_SYSTEM_ENDPOINT}?${queryString}`;
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
 * @param {string} horizon - Study horizon
 * @param {number} studyId - Study id
 * @param {(progress: number) => void} onProgress - Set progress value
 * @returns {Promise<DbTrajectory>} - Promise object that represents a trajectory inserted into database
 */
export const uploadTrajectory = async (
  trajectoryType: string,
  trajectoryName: string,
  horizon: string,
  studyId: number,
  onProgress: (progress: number) => void,
): Promise<DbTrajectory> => {
  const urlApi = `${TRAJECTORY_ENDPOINT}?trajectoryType=${trajectoryType}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
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
    const errorText: string = await (response as Response).text();
    const errorData = JSON.parse(errorText) as Error;
    console.log('===================== errorData', errorData);
    console.log('===================== errorText', errorText);
    throw new Error(`${errorData?.message || errorText}`);
  }
  return (await (response as Response).json()) as DbTrajectory;
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

/**
 * Fetch data of trajectory file from its type and id
 *
 * @param {TRAJECTORY_TYPE} trajectoryType - Trajectory type
 * @param {number} trajectoryId - Trajectory id
 * @return {Promise<Types<TRAJECTORY_DATA_TYPE>[]>}
 */
export const getTrajectoryDataByTypeAndId = async (
  trajectoryType: TRAJECTORY_TYPE,
  trajectoryId: number,
): Promise<Types<TRAJECTORY_DATA_TYPE>[]> => {
  const urlApi = `${TRAJECTORY_DATA_FILE_ENDPOINT}?trajectoryType=${trajectoryType}&trajectoryId=${trajectoryId}`;
  const response = await AuthService.authFetch(urlApi);

  if (!response.ok) {
    throw new Error('Failed to fetch data trajectory');
  }
  return (await response.json()) as Types<TRAJECTORY_DATA_TYPE>[];
};
