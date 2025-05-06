/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE, WARNING_MESSAGE_LEVEL } from '@/shared/enum/trajectory.ts';
import { FileInputStatus } from 'rte-design-system-react';
// @ts-ignore
import { AccessorKeyColumnDef } from '@tanstack/table-core/src/types.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

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
  messages: WarningMessage[];
  loadArea?: string;
}

export interface DbTrajectoryWithState extends DbTrajectory {
  state?: TRAJECTORY_SELECTION_STATUS;
}

export type AreaAndLinkRowData = {
  hypothesis: string;
  trajectory: DbTrajectoryWithState | null;
  status: TRAJECTORY_SELECTION_STATUS;
  isDefault?: boolean;
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

export interface HypothesisTab {
  name: TRAJECTORY_TYPE;
  label: string;
  icon: StdIconId;
  isDisabled: boolean;
}

export interface WarningMessage {
  id: number;
  content: string;
  level: WARNING_MESSAGE_LEVEL;
  code: string;
  generatedBy: string;
  generatedAt: Date;
  trajectory: string;
  secondTrajectory: string;
}
