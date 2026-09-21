/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DbTrajectory, DropdownItemOption, FsTrajectory, isTrajectoryHydroType } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { formatFlowBasedLabel, formatLabel } from '@/shared/utils/textUtils.ts';

export const convertToSelectionOptionType = (trajectories: DbTrajectory[]): DropdownItemOption[] =>
  trajectories.map((trajectory) => ({
    id: String(trajectory.id),
    label: trajectory.trajectoryName,
    value: trajectory.type === TRAJECTORY_TYPE.FLOWBASED ? formatFlowBasedLabel(trajectory.trajectoryName) : trajectory.trajectoryName
  }));

export const isRepositoryTrajectory = (type: TRAJECTORY_TYPE, isDefaultArea = false) =>
  type === TRAJECTORY_TYPE.LOAD || type === TRAJECTORY_TYPE.LOAD_ME ||
  type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER ||
  type === TRAJECTORY_TYPE.MISC_LOAD ||
  (type === TRAJECTORY_TYPE.RES_CAPACITY && isDefaultArea) ||
  type === TRAJECTORY_TYPE.RES_LOAD ||
  isTrajectoryHydroType(type) ||
  type === TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION ||
  type === TRAJECTORY_TYPE.NUCLEAR_FR_TS_LONG_TERM ||
  type === TRAJECTORY_TYPE.ADEQUACY_PATCH ||
  type === TRAJECTORY_TYPE.FLOWBASED ||
  type === TRAJECTORY_TYPE.P2G_CAPACITY_COST ||
  type === TRAJECTORY_TYPE.P2G_MARKET_MODULATION;

export const convertToFSSelectionOptionType = (options: FsTrajectory[], isDefaultArea = false): DropdownItemOption[] =>
  options.map((option, indexTrajectory) => {
    const formattedLabel = formatLabel(option, isDefaultArea);
    return {
      id: String(indexTrajectory),
      label: formattedLabel,
      value: option.type === TRAJECTORY_TYPE.FLOWBASED ? formatFlowBasedLabel(option.trajectoryName) : formattedLabel
    }
  });

export const getNuclearTypeToUse = (indexArray: number[]): TRAJECTORY_TYPE => {
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

export const getHydroTypeToUse = (indexArray: number[], type: TRAJECTORY_TYPE): TRAJECTORY_TYPE => {
  if (type === TRAJECTORY_TYPE.HYDRO_SERIES) {
    return indexArray[1] === 0 ? TRAJECTORY_TYPE.HYDRO_SERIES : TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS;
  }
  if (type === TRAJECTORY_TYPE.HYDRO_PSP_SERIES) {
    return indexArray[1] === 0 ? TRAJECTORY_TYPE.HYDRO_PSP_SERIES : TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS;
  }
  return TRAJECTORY_TYPE.HYDRO_SERIES
}

const getMEHydroTypeToUse = (index: number) => {
  switch (index) {
    case 0:
    default:
      return TRAJECTORY_TYPE.HYDRO_CAPACITY_ME;
    case 1:
      return TRAJECTORY_TYPE.HYDRO_PARAMETERS_ME;
    case 2:
      return TRAJECTORY_TYPE.HYDRO_RESERVOIR_LEVELS_ME;
    case 3:
      return TRAJECTORY_TYPE.HYDRO_TIME_SERIES_ME;
    case 4:
      return TRAJECTORY_TYPE.HYDRO_WATER_VALUES_ME;
  }
}

export const getMETypeToUse = (indexArray: number[]): TRAJECTORY_TYPE => {
  switch (indexArray[0]) {
    case 0:
    default:
      return TRAJECTORY_TYPE.AREA_ME;
    case 1:
      return TRAJECTORY_TYPE.LINK_ME;
    case 2:
      return TRAJECTORY_TYPE.LOAD_ME;
    case 3:
      return TRAJECTORY_TYPE.STS_ME;
    case 4:
      return getMEHydroTypeToUse(indexArray[1]);
    case 5:
      return TRAJECTORY_TYPE.THERMAL_CAPACITY_ME;
    case 6:
      return TRAJECTORY_TYPE.EFFICIENCY_ME;
    case 7:
      return TRAJECTORY_TYPE.CONSTRAINT_ME;
  }
}

export const getConfigurationTypeToUse = (indexArray: number[]): TRAJECTORY_TYPE => {
  if (indexArray.length > 1) {
    return indexArray[1] === 0 ? TRAJECTORY_TYPE.SETTINGS : TRAJECTORY_TYPE.SCENARIO_BUILDER;
  } else {
    return indexArray[0] === 0 ? TRAJECTORY_TYPE.ADEQUACY_PATCH : TRAJECTORY_TYPE.FLOWBASED;
  }
}