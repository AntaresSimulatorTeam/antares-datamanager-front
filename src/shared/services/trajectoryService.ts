/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  TRAJECTORY_COUNT_WARNING_ENDPOINT,
  TRAJECTORY_DATA_BASE_ENDPOINT,
  TRAJECTORY_DATA_FILE_ENDPOINT,
  TRAJECTORY_ENDPOINT,
  TRAJECTORY_FILE_SYSTEM_ENDPOINT,
  TRAJECTORY_LINK_TO_STUDY_ENDPOINT,
  TRAJECTORY_STS,
  TRAJECTORY_THERMAL_COMMON_PARAMETER_IMPORT,
  TRAJECTORY_THERMAL_COSTS_PARAMETER_IMPORT,
  TRAJECTORY_THERMAL_ECONOMIC_PARAMETER_IMPORT,
  TRAJECTORY_THERMAL_INSTALLED_POWER_IMPORT,
  TRAJECTORY_THERMAL_MODULATION_PARAMETER_IMPORT,
  TRAJECTORY_THERMAL_PARAM_MODULATION,
  TRAJECTORY_THERMAL_SPECIFIC_PARAMETER_IMPORT,
  TRAJECTORY_UNLINK_ALL_TO_STUDY_ENDPOINT,
  TRAJECTORY_UNLINK_MULTIPLE_TO_STUDY_ENDPOINT,
  TRAJECTORY_UNLINK_TO_STUDY_ENDPOINT,
} from '@/shared/const/apiEndPoint.ts';
import {
  BackendError,
  DbTrajectory,
  FsTrajectory,
  TRAJECTORY_DATA_TYPE,
  TrajectoryBackendError,
  TrajectoryStateWithWarningMessages,
  Types,
  WarningMessage,
} from '@/shared/types';
import { AuthService } from '@/shared/services/authService.ts';
import { fetchWithProgress } from '@/shared/services/progressService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { fetchWarningMessagesFromType } from './warningService';
import { isBusinessError } from '@/shared/utils/errorUtils.ts';

/**
 * Retrieve a list of trajectories by type and horizon from database
 *
 * @param {TRAJECTORY_TYPE} trajectoryType - Partial name of a study
 * @param {string} horizon - Horizon value (ex: 2020-2021)
 * @param {{ area?: string; technology?: string; fileNameContains?: string }} options - options for searching area in BDD (area, technology or search term)
 * @returns {Promise<DbTrajectory[]>} - Promise object that represents a list of trajectories
 * @throws {Error}
 */
export const fetchTrajectoriesFromDB = async (
  trajectoryType: TRAJECTORY_TYPE,
  horizon: string,
  options?: { area?: string; technology?: string; fileNameContains?: string },
): Promise<DbTrajectory[]> => {
  const queryParams = new URLSearchParams({
    trajectoryType,
    horizon,
    area: options?.area ?? '',
    technology: options?.technology ?? '',
    ...(options?.fileNameContains && { fileNameContains: options.fileNameContains }),
  }).toString();
  const urlApi = `${TRAJECTORY_DATA_BASE_ENDPOINT}?${queryParams}`;

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
 * @param {string | undefined} hypothesis - For STS or thermal capacity trajectory type
 * @param {string | undefined} searchTerm - Autocompletion - filter trajectories by file name
 * @returns {Promise<FsTrajectory[]>} - Promise object that represents a list of trajectories
 * @throws {Error}
 */
export const fetchTrajectoriesFromFS = async (
  trajectoryType: TRAJECTORY_TYPE,
  hypothesis?: string,
  searchTerm?: string,
): Promise<FsTrajectory[]> => {
  const queryString = new URLSearchParams({
    trajectoryType,
    ...(trajectoryType !== TRAJECTORY_TYPE.STS && hypothesis && { area: hypothesis }),
    ...(trajectoryType === TRAJECTORY_TYPE.STS && hypothesis && { technology: hypothesis }),
    ...(searchTerm && { fileNameContains: searchTerm }),
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
 * Asynchronously uploads a trajectory into the data base and tracks the progress of the operation.
 *
 * @param {TRAJECTORY_TYPE} trajectoryType - Type of the trajectory (AREA, LINK, LOAD...)
 * @param {string | undefined} area - The geographical area associated with the trajectory, may be undefined.
 * @param {string} trajectoryToUse - The name of the trajectory to be uploaded.
 * @param {string} horizon - The time horizon associated with the trajectory.
 * @param {number} studyId - The unique identifier for the associated study.
 * @param {boolean} isCivilYear - Indicates whether the horizon is based on the civil or a different calendar year.
 * @param {(progress: number) => void} onProgress - A callback function invoked to report progress updates. Receives a numeric progress value.
 * @param {string | undefined} subArea - The subarea associated with the trajectory, may be undefined.
 * @param {string} subArea - Hypothesis from sub row (ex: Technology for STS trajectory type : Battery, DSR, EV PSP)
 * @returns {Promise<DbTrajectory>} A promise that resolves to the uploaded trajectory object.
 * @throws {Error} If the upload process fails or an invalid response is encountered.
 */
export const uploadTrajectory = async (
  trajectoryType: TRAJECTORY_TYPE,
  trajectoryToUse: string,
  horizon: string,
  studyId: number,
  area: string | undefined,
  onProgress: (progress: number) => void,
  isCivilYear?: boolean,
  subArea?: string,
): Promise<DbTrajectory> => {
  let urlApi;
  const trajectoryName = encodeURIComponent(trajectoryToUse);
  if (trajectoryType === TRAJECTORY_TYPE.LOAD) {
    urlApi = `${TRAJECTORY_ENDPOINT}/load?area=${area}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
  } else if (trajectoryType === TRAJECTORY_TYPE.THERMAL_CAPACITY) {
    urlApi = `${TRAJECTORY_THERMAL_INSTALLED_POWER_IMPORT}?area=${area}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}&technology=${subArea ?? ''}`;
  } else if (trajectoryType === TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER) {
    urlApi = `${TRAJECTORY_THERMAL_COMMON_PARAMETER_IMPORT}?trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
  } else if (trajectoryType === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
    urlApi = `${TRAJECTORY_THERMAL_SPECIFIC_PARAMETER_IMPORT}?area=${subArea ?? ''}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
  } else if (trajectoryType === TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER) {
    urlApi = `${TRAJECTORY_THERMAL_MODULATION_PARAMETER_IMPORT}?area=${subArea ?? ''}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
  } else if (trajectoryType === TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER) {
    urlApi = `${TRAJECTORY_THERMAL_COSTS_PARAMETER_IMPORT}?trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
  } else if (trajectoryType === TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER) {
    urlApi = `${TRAJECTORY_THERMAL_ECONOMIC_PARAMETER_IMPORT}?trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
  } else if (trajectoryType === TRAJECTORY_TYPE.STS) {
    urlApi = `${TRAJECTORY_STS}?area=${area}&technology=${subArea}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}&isCivilYear=${isCivilYear}`;
  } else {
    urlApi = `${TRAJECTORY_ENDPOINT}?trajectoryType=${trajectoryType}&trajectoryToUse=${trajectoryName}&horizon=${horizon}&studyId=${studyId}`;
  }

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
    if (isBusinessError(error)) {
      throw error;
    } else {
      throw new TrajectoryBackendError(`Failed to upload trajectory ${trajectoryName}`, error);
    }
  }
};

/**
 * Linked a trajectory to study
 * @param {TRAJECTORY_TYPE} type - Trajectory type
 * @param {number} trajectoryId - Trajectory id
 * @param {number} studyId - Study id
 *
 * @return {Promise<DbTrajectory>} - Trajectory linked to a study
 * @throws {Error}
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
 * @throws {BackendError}
 */
export const unlinkTrajectoryFromStudy = async (trajectoryId: number, studyId: number): Promise<void> => {
  const params = new URLSearchParams({
    trajectoryId: trajectoryId.toString(),
    studyId: studyId.toString(),
  });
  const urlApi = `${TRAJECTORY_UNLINK_TO_STUDY_ENDPOINT}?${params.toString()}`;

  try {
    await AuthService.authFetch(urlApi, {
      method: 'DELETE',
    });
  } catch (error: unknown) {
    if (isBusinessError(error)) {
      throw new TrajectoryBackendError(`${error.antaresErrorMessage}`, error);
    } else {
      throw new TrajectoryBackendError(`Failed to unlink trajectory ${trajectoryId} from study ${studyId}`, error);
    }
  }
};

/**
 * Delete all trajectories linked to a study
 * @param {number} studyId - Study id
 * @return {Promise<void>}
 * @throws {Error}
 */
export const unlinkAllTrajectoriesFromStudy = async (studyId: number): Promise<void> => {
  const urlApi = `${TRAJECTORY_UNLINK_ALL_TO_STUDY_ENDPOINT}?studyId=${studyId}`;
  try {
    await AuthService.authFetch(urlApi, {
      method: 'DELETE',
    });
  } catch (error) {
    throw new Error((error as BackendError)?.antaresErrorMessage);
  }
};

/**
 * Delete all trajectories linked to a study
 * @param {number} studyId - Study id
 * @param {number[]} trajectoryIds - Trajectory id list to delete
 * @return {Promise<void>}
 * @throws {Error}
 */
export const unlinkMultipleTrajectoriesFromStudy = async (studyId: number, trajectoryIds: number[]): Promise<void> => {
  const urlApi = `${TRAJECTORY_UNLINK_MULTIPLE_TO_STUDY_ENDPOINT}?studyId=${studyId}`;
  try {
    await AuthService.authFetch(urlApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trajectoryIds),
    });
  } catch (error) {
    throw new Error((error as BackendError)?.antaresErrorMessage);
  }
};

/**
 * Fetch data of trajectory file from its type and id
 *
 * @param {TRAJECTORY_TYPE} trajectoryType - Trajectory type
 * @param {number} trajectoryId - Trajectory id
 * @return {Promise<Types<TRAJECTORY_DATA_TYPE>[]>}
 * @throws {Error}
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
 * Count the number of warning messages per trajectory type for a study
 * @param {number} id - Study i
 * @returns {Promise<{ [key in keyof typeof TRAJECTORY_TYPE]: number }>} - Number of warning messages per trajectory type
 * @throws {Error}
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
 * @return {Promise<TrajectoryStateWithWarningMessages>} Array of trajectories (data base trajectories)
 * @throws {Error}
 */
export const getStudyTrajectoriesWithWarnings = async (
  studyId: number,
  trajectoryType: TRAJECTORY_TYPE,
): Promise<TrajectoryStateWithWarningMessages> => {
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

/**
 * Check if the cluster of a trajectory (THERMAL_TECHNICAL_SPECIFIC_PARAMETER) requires a parameter modulation (CM or MR value is 1)
 * @param {number} studyId
 * @param {string} horizon
 */
export const isParamModulationRequired = async (studyId: number, horizon: string): Promise<boolean> => {
  try {
    const urlApi = `${TRAJECTORY_THERMAL_PARAM_MODULATION}?horizon=${horizon}&studyId=${studyId}`;
    const response = await AuthService.authFetch(urlApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return (await (response as Response).json()) as boolean;
  } catch (error) {
    throw new Error((error as BackendError).antaresErrorMessage);
  }
};
