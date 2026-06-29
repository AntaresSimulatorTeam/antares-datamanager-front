/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { FileInputStatus } from 'rte-design-system-react';
// @ts-ignore
import { AccessorKeyColumnDef } from '@tanstack/table-core/src/types.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { TrajectoryState } from '@/shared/types/Study.type.ts';

export interface FsTrajectory {
  trajectoryName: string;
  type: TRAJECTORY_TYPE;
  lastModifiedDate: Date;
}

export interface DbTrajectory {
  id: number;
  trajectoryName: string;
  type: TRAJECTORY_TYPE;
  version: number;
  userName: string;
  creationDate: Date;
  area: string;
  technology: string;
  hasTimeSeries: boolean;
  state?: TRAJECTORY_SELECTION_STATUS;
}

export type HypothesisRowData = {
  hypothesis: string;
  trajectory: DbTrajectory | null;
  status: TRAJECTORY_SELECTION_STATUS;
  isDefault?: boolean;
  subRows?: HypothesisRowData[] | null;
  isDeletable?: boolean;
  timeSeries?: string;
  hvdc?: boolean;
};

export type RowStatus = FileInputStatus | 'warning' | 'emptyError';

export interface TrajectoryViewData {
  trajectory: DbTrajectory;
  data: Types<TRAJECTORY_DATA_TYPE>[];
  columns: AccessorKeyColumnDef<Types<TRAJECTORY_DATA_TYPE>>[];
}

export enum TRAJECTORY_DATA_TYPE {
  TrajectoryAreaData = 'TrajectoryAreaData',
  TrajectoryLinkData = 'TrajectoryLinkData',
  TrajectorySTSData = 'TrajectorySTSData',
}

export type Types<T extends TRAJECTORY_DATA_TYPE> = T extends TrajectorySTSData
  ? TrajectorySTSData
  : T extends TrajectoryLinkData
    ? TrajectoryLinkData
    : TrajectoryAreaData;

export interface TrajectoryAreaData {
  areaName: string;
  spilledEnergyCost: string | null;
  unsuppliedEnergyCost: string | null;
}

export const TrajectoryAreaDataScheme = {
  areaName: 'string',
  spilledEnergyCost: 'string',
  unsuppliedEnergyCost: 'string',
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
  hvdcMwDirect: number | null;
  hvdcMwIndirect: number | null;
  hvdcNbDirect: number | null;
  hvdcNbIndirect: number | null;
  hvdcFoRateDirect: number | null;
  hvdcFoRateIndirect: number | null;
  hvdc: string | null;
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
  hvdcMwDirect: 'number',
  hvdcMwIndirect: 'number',
  hvdcNbDirect: 'number',
  hvdcNbIndirect: 'number',
  hvdcFoRateDirect: 'number',
  hvdcFoRateIndirect: 'number',
  hurdleCost: 'number',
} as const;

export interface TrajectorySTSData {
  name: string;
  series: string;
}

export const TrajectorySTSDataScheme = {
  cluster: 'string',
  series: 'string',
} as const;

export interface HypothesisTab extends Tab {
  icon: StdIconId;
  isDisabled: boolean;
}

export interface Tab {
  name: TRAJECTORY_TYPE;
  label: string;
}

export type ThermalParamTrajectoryType =
  | TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER
  | TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER
  | TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER;

export type DsrTrajectoryType = TRAJECTORY_TYPE.DSR | TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION;

export type ParamTrajectoryState = Record<ThermalParamTrajectoryType, TrajectoryState>;

export type TrajectoryWithSubRowsType = TRAJECTORY_TYPE.THERMAL_CAPACITY | TRAJECTORY_TYPE.STS;

export interface TechnologyType {
  id: number;
  label: string;
  code: string;
}
