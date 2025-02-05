/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  TRAJECTORY_DATA_BASE_ENDPOINT,
  TRAJECTORY_ENDPOINT,
  TRAJECTORY_FILE_SYSTEM_ENDPOINT,
} from '@/shared/const/apiEndPoint.ts';
import { DbTrajectory, FsTrajectory } from '@/shared/types/Trajectory.type.ts';

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
  const response = await fetch(
    `${TRAJECTORY_DATA_BASE_ENDPOINT}?trajectoryType=${trajectoryType}&horizon=${horizon}&fileNameStartsWith=${fileName ?? ''}`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch trajectories from file system');
  }
  return await response.json();
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
  const response = await fetch(
    `${TRAJECTORY_FILE_SYSTEM_ENDPOINT}?trajectoryType=${trajectoryType}&thermalCapacityArea=${thermalCapacityArea ?? ''}`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch trajectories from file system');
  }
  return await response.json();
};

/**
 * Import a trajectory file into database
 *
 * @param {TRAJECTORY_TYPE} trajectoryType - Trajectory type
 * @param {string} trajectoryToUse - Trajectory to use
 * @param {string} horizon - Trajectory horizon
 * @returns {Promise<DbTrajectory>} - Promise object that represents a trajectory inserted into database
 */
export const createTrajectory = async (
  trajectoryType: string,
  trajectoryToUse: string,
  horizon: string,
): Promise<DbTrajectory> => {
  const response = await fetch(
    `${TRAJECTORY_ENDPOINT}?trajectoryType=${trajectoryType}&trajectoryToUse=${trajectoryToUse}&horizon=${horizon}`,
  );
  if (!response.ok) {
    throw new Error('Failed to import trajectory into data base');
  }
  return await response.json();
};
