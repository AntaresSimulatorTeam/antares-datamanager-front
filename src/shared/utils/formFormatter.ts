/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DbTrajectory, FsTrajectory } from '@/shared/types';

export const convertToSelectionOptionType = (trajectories: DbTrajectory[]): SelectOption[] =>
  trajectories.map((trajectory) => ({
    id: trajectory.id,
    label: trajectory.trajectoryName,
  }));

export const convertToFSSelectionOptionType = (options: FsTrajectory[]): SelectOption[] =>
  options.map((option, indexTrajectory) => ({
    id: indexTrajectory,
    label: option.trajectoryName ? option.trajectoryName.substring(0, option.trajectoryName.lastIndexOf('.')) : '',
  }));
