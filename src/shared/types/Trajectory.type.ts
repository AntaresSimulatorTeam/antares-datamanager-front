/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { FileInputStatus } from 'rte-design-system-react';
import { WithNullableFields } from '@/shared/types/Generic.type.ts';
// @ts-ignore
import { AccessorKeyColumnDef } from '@tanstack/table-core/src/types.ts';

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

export interface TrajectoryViewData {
  trajectory: DbTrajectory;
  data: Types<TRAJECTORY_DATA_TYPE>[];
  columns: AccessorKeyColumnDef<Types<TRAJECTORY_DATA_TYPE>>[];
}

export enum TRAJECTORY_DATA_TYPE {
  TrajectoryAreaData = 'TrajectoryAreaData',
  TrajectoryLinkData = 'BTrajectoryLinkData',
}

export type Types<T extends TRAJECTORY_DATA_TYPE> = T extends TrajectoryAreaData
  ? TrajectoryAreaData
  : TrajectoryLinkData;

export interface TrajectoryAreaData {
  areaName: string;
  powerToGas: string | null;
  shortTermStorage: string | null;
}

export const TrajectoryAreaDataScheme = {
  areaName: 'string',
  powerToGas: 'string',
  shortTermStorage: 'string',
} as const;

export interface TrajectoryLinkData {
  name: string;
  winterHpDirectMw: number | null;
  winterHpIndirectMw: number | null;
  winterHcDirectMw: number | null;
  winterHcIndirectMw: number | null;
  summerHpDirectMw: number | null;
  summerHpIndirectMw: number | null;
  summerHcDirectMw: number | null;
  summerHcIndirectMw: number | null;
  flowbasedPerimeter: string | null;
  hvdc: string | null;
  specificTs: string | null;
  forcedOutageHvac: string | null;
  hurdleCost: number | null;
}

export const TrajectoryLinkDataScheme = {
  name: 'string',
  winterHpDirectMw: 'number',
  winterHpIndirectMw: 'number',
  winterHcDirectMw: 'number',
  winterHcIndirectMw: 'number',
  summerHpDirectMw: 'number',
  summerHpIndirectMw: 'number',
  summerHcDirectMw: 'number',
  summerHcIndirectMw: 'number',
  flowbasedPerimeter: 'string',
  hvdc: 'string',
  specificTs: 'string',
  forcedOutageHvac: 'string',
  hurdleCost: 'number',
} as const;
