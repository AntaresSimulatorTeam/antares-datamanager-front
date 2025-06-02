/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  HYPOTHESIS_LOAD_DEFAULT,
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
import { BackendError } from '@/shared/utils/errrorHandler.ts';

/**
 * Retrieve a list of trajectories by type and horizon from database
 *
 * @param {TRAJECTORY_TYPE} trajectoryType - Partial name of a study
 * @param {string} horizon - Horizon value (ex: 2020-2021)
 * @param {string | undefined} fileName - Autocompletion - filter trajectories by file name
 * @param {string | undefined} area - To use just in thermal capacity case
 * @returns {Promise<DbTrajectory[] | Error>} - Promise object that represents a list of trajectories
 */
export const fetchTrajectoriesFromDB = async (
  trajectoryType: string,
  horizon: string,
  fileName?: string,
  area?: string,
): Promise<DbTrajectory[] | Error> => {
  const urlApi = `${TRAJECTORY_DATA_BASE_ENDPOINT}?trajectoryType=${trajectoryType}&horizon=${horizon}&fileNameContains=${fileName ?? ''}&loadArea=${area ?? ''}`;
  try {
    const response = await AuthService.authFetch(urlApi);
    return (await (response as Response).json()) as DbTrajectory[];
  } catch {
    throw new Error('Failed to fetch trajectories from data base');
  }
};

/**
 * Retrieve a list of trajectories by type and thermal capacity area from file system
 *
 * @param {TRAJECTORY_TYPE} trajectoryType - Partial name of a study
 * @param {string | undefined} thermalCapacityArea - To use just in thermal capacity case
 * @param {string | undefined} searchTerm - Autocompletion - filter trajectories by file name
 * @returns {Promise<FsTrajectory[] | Error>} - Promise object that represents a list of trajectories
 */
export const fetchTrajectoriesFromFS = async (
  trajectoryType: string,
  searchTerm?: string | undefined,
  thermalCapacityArea?: string | undefined,
): Promise<FsTrajectory[] | Error> => {
  const queryString = new URLSearchParams({
    trajectoryType: trajectoryType ?? '',
    thermalCapacityArea: thermalCapacityArea ?? '',
    fileNameContains: searchTerm ?? '',
  }).toString();

  const urlApi = `${TRAJECTORY_FILE_SYSTEM_ENDPOINT}?${queryString}`;
  try {
    const response = await AuthService.authFetch(urlApi);
    return (await (response as Response).json()) as FsTrajectory[];
  } catch {
    throw new Error('Failed to fetch trajectories from file system');
  }
};

/**
 * Import a trajectory file into database
 *
 * @param {TRAJECTORY_TYPE} trajectoryType - Trajectory type
 * @param {string} trajectoryName - Name of trajectory to add to data base
 * @param {string} horizon - Study horizon
 * @param {number} studyId - Study id
 * @param {(progress: number) => void} onProgress - Set progress value
 * @param {string | undefined} area - Area to use in thermal capacity case
 * @returns {Promise<DbTrajectory | Error>} - Promise object that represents a trajectory inserted into database
 */
export const uploadTrajectory = async (
  trajectoryType: TRAJECTORY_TYPE,
  trajectoryName: string,
  horizon: string,
  studyId: number,
  area: string | undefined,
  onProgress: (progress: number) => void,
): Promise<DbTrajectory | Error> => {
  const urlApi = `${TRAJECTORY_ENDPOINT}?trajectoryType=${trajectoryType}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
  const urlLoadApi = `${TRAJECTORY_ENDPOINT}/load?area=${area}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
  try {
    const response = await fetchWithProgress(
      trajectoryType === TRAJECTORY_TYPE.LOAD ? urlLoadApi : urlApi,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      onProgress,
    );
    return (await (response as Response).json()) as DbTrajectory;
  } catch (error) {
    throw new Error(`${(error as Error)?.message}`);
  }
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
  try {
    const response = await AuthService.authFetch(urlApi, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return (await (response as Response).json()) as DbTrajectory;
  } catch (error) {
    throw new Error((error as BackendError)?.antaresErrorMessage);
  }
};

/**
 * Delete a link between a trajectory and a study
 *
 * @param {number} trajectoryId - Trajectory id
 * @param {number} studyId - Study id
 */
export const unlinkTrajectoryFromStudy = async (trajectoryId: number, studyId: number): Promise<void | Error> => {
  const urlApi = `${TRAJECTORY_LINK_TO_STUDY_ENDPOINT}?trajectoryId=${trajectoryId}&studyId=${studyId}`;
  try {
    await AuthService.authFetch(urlApi, {
      method: 'DELETE',
    });
  } catch (error) {
    throw new Error(`${(error as BackendError)?.antaresErrorMessage}`);
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

  if (!(response as Response).ok) {
    throw new Error('Failed to fetch data trajectory');
  }
  return (await (response as Response).json()) as Types<TRAJECTORY_DATA_TYPE>[];
};

/**
 * Fetch load default hypothesis (LOAD_OTHERS, LOAD_FR...)
 */
export const getDefaultLoadHypothesis = async (): Promise<{ name: string }[]> => {
  const response = await AuthService.authFetch(HYPOTHESIS_LOAD_DEFAULT);
  if (!(response as Response).ok) {
    throw new Error('Failed to fetch default load hypothesis');
  }
  return (await (response as Response).json()) as { name: string }[];
};
