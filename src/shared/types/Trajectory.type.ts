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

export interface TrajectoryAreaData {
  area_name: string;
  power_to_gas: string;
  short_term_storage: string;
}

export interface TrajectoryLinkData {
  link_name: string;
  direct_w_hp: number;
  direct_w_hc: number;
  direct_s_hp: number;
  direct_s_hc: number;
  indirect_w_hp: number;
  indirect_w_hc: number;
  indirect_s_hp: number;
  indirect_s_hc: number;
  flowbased_perimeter: string;
  hvdc: string;
  specific_ts: string;
  forced_outage_hvac: string;
  hurdle_cost: number;
}
