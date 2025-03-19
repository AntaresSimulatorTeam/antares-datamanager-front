/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { FileInputStatus } from 'rte-design-system-react';
import { WithNullableFields } from '@/shared/types/Generic.type.ts';

export interface FsTrajectory {
  trajectoryName: string;
  type: string;
  lastModifiedDate: Date;
}

export interface DbTrajectory {
  id: number;
  trajectoryName: string;
  type: TRAJECTORY_TYPE;
  version: number;
  userName: string;
  creationDate: Date;
}

export type AreaAndLinkRowData = {
  hypothesis: string;
  trajectory: WithNullableFields<DbTrajectory, 'type' | 'version' | 'userName' | 'creationDate'> | null;
  status: TRAJECTORY_SELECTION_STATUS;
};

export type RowStatus = FileInputStatus | 'warning' | 'emptyError';
