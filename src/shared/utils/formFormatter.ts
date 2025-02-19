/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DbTrajectory, FsTrajectory, RowStatus } from '@/shared/types';
import { FileInputStatus } from 'rte-design-system-react';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';

export const convertToSelectionOptionType = (trajectories: DbTrajectory[]): SelectOption[] =>
  trajectories.map((trajectory) => ({
    id: trajectory.id,
    label: trajectory.trajectory_name,
  }));

export const convertToFSSelectionOptionType = (options: FsTrajectory[]): SelectOption[] =>
  options.map((option, indexTrajectory) => ({
    id: `option-fs-${indexTrajectory}`,
    label: option.trajectory_name ? option.trajectory_name.substring(0, option.trajectory_name.lastIndexOf('.')) : '',
  }));

export const getStatus = (status: RowStatus) => {
  switch (status) {
    case 'error':
      return TRAJECTORY_SELECTION_STATUS.ERROR;
    case 'success':
      return TRAJECTORY_SELECTION_STATUS.OK;
    case 'warning':
      return TRAJECTORY_SELECTION_STATUS.WARNING;
    case 'empty':
    default:
      return TRAJECTORY_SELECTION_STATUS.MISSING;
  }
};

export const getBgColor = (status: FileInputStatus) => {
  switch (status) {
    case 'loading':
      return 'bg-acc1-600';
    case 'success':
    case 'error':
      return `bg-${status}-600`;
    case 'empty':
    default:
      return 'bg-gray-600';
  }
};
