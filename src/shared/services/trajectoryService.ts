/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  HYPOTHESIS_LOAD_DEFAULT,
  TRAJECTORY_COUNT_WARNING_ENDPOINT,
  TRAJECTORY_DATA_BASE_ENDPOINT,
  TRAJECTORY_DATA_FILE_ENDPOINT,
  TRAJECTORY_ENDPOINT,
  TRAJECTORY_FILE_SYSTEM_ENDPOINT,
  TRAJECTORY_LINK_TO_STUDY_ENDPOINT,
  TRAJECTORY_THERMAL_INSTALLED_POWER_IMPORT,
  TRAJECTORY_UNLINK_TO_STUDY_ENDPOINT,
} from '@/shared/const/apiEndPoint.ts';
import {
  BackendError,
  DbTrajectory,
  FsTrajectory,
  TRAJECTORY_DATA_TYPE,
  TrajectoryState,
  Types,
  WarningMessage,
} from '@/shared/types';
import { AuthService } from '@/shared/services/authService.ts';
import { fetchWithProgress } from '@/shared/services/progressService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { fetchWarningMessagesFromType } from './warningService';

/**
 * Retrieve a list of trajectories by type and horizon from database
 *
 * @param {TRAJECTORY_TYPE} trajectoryType - Partial name of a study
 * @param {string} horizon - Horizon value (ex: 2020-2021)
 * @param {string | undefined} fileName - Autocompletion - filter trajectories by file name
 * @param {string | undefined} area - To use just in thermal capacity case
 * @returns {Promise<DbTrajectory[]>} - Promise object that represents a list of trajectories
 */
export const fetchTrajectoriesFromDB = async (
  trajectoryType: string,
  horizon: string,
  fileName?: string,
  area?: string,
): Promise<DbTrajectory[]> => {
  const urlApi = `${TRAJECTORY_DATA_BASE_ENDPOINT}?trajectoryType=${trajectoryType}&horizon=${horizon}&fileNameContains=${fileName ?? ''}&loadArea=${area ?? ''}`;
  try {
    const response = await AuthService.authFetch(urlApi);
    return (await (response as Response).json()) as DbTrajectory[];
  } catch (error) {
    throw new Error((error as BackendError).antaresErrorMessage);
  }
};

/**
 * Retrieve a list of trajectories by type and thermal capacity area from file system
 *
 * @param {TRAJECTORY_TYPE} trajectoryType - Partial name of a study
 * @param {string | undefined} zone - To use just in thermal capacity case
 * @param {string | undefined} searchTerm - Autocompletion - filter trajectories by file name
 * @returns {Promise<FsTrajectory[]>} - Promise object that represents a list of trajectories
 */
export const fetchTrajectoriesFromFS = async (
  trajectoryType: TRAJECTORY_TYPE,
  searchTerm?: string | undefined,
  zone?: string | undefined,
): Promise<FsTrajectory[]> => {
  const queryString = new URLSearchParams({
    trajectoryType: trajectoryType ?? '',
    zone: zone ?? '',
    fileNameContains: searchTerm ?? '',
  }).toString();

  const urlApi = `${TRAJECTORY_FILE_SYSTEM_ENDPOINT}?${queryString}`;
  try {
    const response = await AuthService.authFetch(urlApi);
    return (await (response as Response).json()) as FsTrajectory[];
  } catch (error) {
    throw new Error((error as BackendError).antaresErrorMessage);
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
 * @returns {Promise<DbTrajectory>} - Promise object that represents a trajectory inserted into database
 */
export const uploadTrajectory = async (
  trajectoryType: TRAJECTORY_TYPE,
  trajectoryName: string,
  horizon: string,
  studyId: number,
  area: string | undefined,
  onProgress: (progress: number) => void,
): Promise<DbTrajectory> => {
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

    return (await response.json()) as DbTrajectory;
  } catch (error) {
    throw new Error((error as Error)?.message ?? '');
  }
};

/**
 * Asynchronously uploads a trajectory with the given parameters and tracks the progress of the operation.
 *
 * @param {string | undefined} area - The geographical area associated with the trajectory, may be undefined.
 * @param {string} trajectoryName - The name of the trajectory to be uploaded.
 * @param {string} horizon - The time horizon associated with the trajectory.
 * @param {number} studyId - The unique identifier for the associated study.
 * @param {boolean} isCivilYear - Indicates whether the horizon is based on the civil or a different calendar year.
 * @param {(progress: number) => void} onProgress - A callback function invoked to report progress updates. Receives a numeric progress value.
 * @param {string} technology - The technology associated with the trajectory.
 * @returns {Promise<DbTrajectory>} A promise that resolves to the uploaded trajectory object.
 * @throws {Error} If the upload process fails or an invalid response is encountered.
 */
export const uploadTrajectoryWithTechnology = async (
  area: string | undefined,
  trajectoryName: string,
  horizon: string,
  studyId: number,
  isCivilYear: boolean,
  onProgress: (progress: number) => void,
  technology?: string,
): Promise<DbTrajectory> => {
  const urlApi = `${TRAJECTORY_THERMAL_INSTALLED_POWER_IMPORT}?area=${area}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}&technology=${technology ?? ''}`;

  try {
    const response = await fetchWithProgress(
      urlApi,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      onProgress,
    );

    return (await response.json()) as DbTrajectory;
  } catch (error) {
    throw new Error((error as Error)?.message ?? '');
  }
};

/**
 * Linked a trajectory to study
 * @param {TRAJECTORY_TYPE} type - Trajectory type
 * @param {number} trajectoryId - Trajectory id
 * @param {number} studyId - Study id
 *
 * @return {Promise<DbTrajectory>} - Trajectory linked to a study
 */

export const linkTrajectoryToStudy = async (
  type: TRAJECTORY_TYPE,
  trajectoryId: number,
  studyId: number,
): Promise<DbTrajectory> => {
  const urlApi = `${TRAJECTORY_LINK_TO_STUDY_ENDPOINT}?type=${type}&trajectoryId=${trajectoryId}&studyId=${studyId}`;
  try {
    const response = await AuthService.authFetch(urlApi, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return (await (response as Response).json()) as unknown as DbTrajectory;
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
export const unlinkTrajectoryFromStudy = async (trajectoryId: number, studyId: number): Promise<void> => {
  const urlApi = `${TRAJECTORY_UNLINK_TO_STUDY_ENDPOINT}?trajectoryId=${trajectoryId}&studyId=${studyId}`;
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
  try {
    const response = await AuthService.authFetch(urlApi);
    return (await (response as Response).json()) as Types<TRAJECTORY_DATA_TYPE>[];
  } catch (error) {
    throw new Error((error as BackendError).antaresErrorMessage);
  }
};

/**
 * Fetch load default hypothesis (LOAD_OTHERS, LOAD_FR...)
 * @return {Promise<{ name: string }[]>}
 */
export const getDefaultLoadHypothesis = async (): Promise<{ name: string }[]> => {
  try {
    const response = await AuthService.authFetch(HYPOTHESIS_LOAD_DEFAULT);
    return (await (response as Response).json()) as { name: string }[];
  } catch (error) {
    throw new Error((error as BackendError).antaresErrorMessage);
  }
};

/**
 * Count the number of warning messages per trajectory type for a study
 * @param {number} id - Study i
 * @returns {Promise<{ [key in keyof typeof TRAJECTORY_TYPE]: number }>} - Number of warning messages per trajectory type
 */

export const getNbMessagesFromTrajectoryType = async (
  id: number,
): Promise<{ [key in keyof typeof TRAJECTORY_TYPE]: number }> => {
  try {
    const response = await AuthService.authFetch(`${TRAJECTORY_COUNT_WARNING_ENDPOINT}/${id}`);
    return (await (response as Response).json()) as { [key in keyof typeof TRAJECTORY_TYPE]: number };
  } catch (error) {
    throw new Error((error as BackendError).antaresErrorMessage);
  }
};

/**
 * Fetch warning messages for each trajectory linked to a study
 * @param {number} studyId - Study id
 * @param {TRAJECTORY_TYPE} trajectoryType - Trajectory type
 *
 * @return {Promise<{trajectories: DbTrajectory[], warningMessages: WarningMessage[]}>} Array of trajectories (data base trajectories)
 * @throws {Error}
 */
export const getStudyTrajectoriesWithWarnings = async (
  studyId: number,
  trajectoryType?: TRAJECTORY_TYPE,
): Promise<TrajectoryState> => {
  try {
    const trajectories: DbTrajectory[] = await getStudyTrajectories(studyId, trajectoryType);
    let warningMessages: WarningMessage[] = [];
    if (trajectories?.length > 0 && trajectoryType) {
      warningMessages = await fetchWarningMessagesFromType(trajectoryType, studyId);
    }
    return { trajectories, warningMessages };
  } catch (error) {
    throw new Error((error as BackendError).antaresErrorMessage);
  }
};
