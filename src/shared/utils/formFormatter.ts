/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DbTrajectory } from '@/shared/types';

export const convertToSelectionOptionType = (trajectories: DbTrajectory[]): SelectOption[] =>
  trajectories.map((trajectory) => ({
    id: trajectory.id,
    label: trajectory.trajectory_name,
  }));
