/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DbTrajectory, FsTrajectory, SelectOption } from '@/shared/types';
import {TRAJECTORY_TYPE} from "@/shared/enum/trajectory.ts";

export const convertToSelectionOptionType = (trajectories: DbTrajectory[]): SelectOption[] =>
  trajectories.map((trajectory) => ({
    id: trajectory.id,
    label: trajectory.trajectoryName,
  }));

export const convertToFSSelectionOptionType = (options: FsTrajectory[]): SelectOption[] =>
  options.map((option, indexTrajectory) => ({
    id: indexTrajectory,
    label: (option.trajectoryName && option.type != TRAJECTORY_TYPE.LOAD) ? option.trajectoryName.substring(0, option.trajectoryName.lastIndexOf('.')) : option.trajectoryName,
  }));
