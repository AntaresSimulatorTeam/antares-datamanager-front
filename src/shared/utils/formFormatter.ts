/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DbTrajectory, FsTrajectory, isTrajectoryHydroType } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { formatFlowBasedLabel, formatLabel } from '@/shared/utils/textUtils.ts';
import { DropdownItemProps } from '@design-system-rte/core/components/dropdown/dropdown.interface';

export const convertToSelectionOptionType = (trajectories: DbTrajectory[]): DropdownItemProps[] =>
  trajectories.map((trajectory) => ({
    id: trajectory.id,
    label: trajectory.trajectoryName,
    value: trajectory.type === TRAJECTORY_TYPE.FLOWBASED ? formatFlowBasedLabel(trajectory.trajectoryName) : trajectory.trajectoryName
  }));

export const isRepositoryTrajectory = (type: TRAJECTORY_TYPE, isDefaultArea = false) =>
  type === TRAJECTORY_TYPE.LOAD ||
  type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER ||
  type === TRAJECTORY_TYPE.MISC_LOAD ||
  (type === TRAJECTORY_TYPE.RES_CAPACITY && isDefaultArea) ||
  type === TRAJECTORY_TYPE.RES_LOAD ||
  isTrajectoryHydroType(type) ||
  type === TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION ||
  type === TRAJECTORY_TYPE.NUCLEAR_FR_TS_LONG_TERM ||
  type === TRAJECTORY_TYPE.ADEQUACY_PATCH ||
  type === TRAJECTORY_TYPE.FLOWBASED;

export const convertToFSSelectionOptionType = (options: FsTrajectory[], isDefaultArea = false): DropdownItemProps[] =>
  options.map((option, indexTrajectory) => {
    const formattedLabel = formatLabel(option, isDefaultArea);
    return {
      id: indexTrajectory,
      label: formattedLabel
    }
  });

export const getNuclearTrajectoryType = (indexArray: number[]): TRAJECTORY_TYPE => {
  if (indexArray.length === 2) {
    if (indexArray[1] === 0) {
      return TRAJECTORY_TYPE.NUCLEAR_FR_TS_ERP;
    }
    if (indexArray[1] === 1) {
      return TRAJECTORY_TYPE.NUCLEAR_FR_TS_LONG_TERM;
    }
    if (indexArray[1] === 2) {
      return TRAJECTORY_TYPE.NUCLEAR_FR_TS_SMR;
    }
  } else if (indexArray[0] === 1) {
    return TRAJECTORY_TYPE.NUCLEAR_FR_TALON;
  }
    return TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION;
}