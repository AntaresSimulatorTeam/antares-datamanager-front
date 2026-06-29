/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DbTrajectory, FsTrajectory, isTrajectoryHydroType, SelectOption } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

export const convertToSelectionOptionType = (trajectories: DbTrajectory[]): SelectOption[] =>
  trajectories.map((trajectory) => ({
    id: trajectory.id,
    label: trajectory.trajectoryName,
  }));

export const isRepositoryTrajectory = (type: TRAJECTORY_TYPE, isDefaultArea = false) =>
  type === TRAJECTORY_TYPE.LOAD ||
  type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER ||
  type === TRAJECTORY_TYPE.MISC_LOAD ||
  (type === TRAJECTORY_TYPE.RES_CAPACITY && isDefaultArea) ||
  type === TRAJECTORY_TYPE.RES_LOAD ||
  isTrajectoryHydroType(type) ||
  type === TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION ||
  type === TRAJECTORY_TYPE.NUCLEAR_FR_TS_LONG_TERM;

export const convertToFSSelectionOptionType = (options: FsTrajectory[], isDefaultArea = false): SelectOption[] =>
  options.map((option, indexTrajectory) => ({
    id: indexTrajectory,
    label:
      option.trajectoryName && !isRepositoryTrajectory(option.type, isDefaultArea)
        ? option.trajectoryName.substring(0, option.trajectoryName.lastIndexOf('.'))
        : option.trajectoryName,
  }));
