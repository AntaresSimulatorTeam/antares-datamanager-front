import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';
import { AccessorKeyColumnDefBase, DeepKeys, DeepValue, StringOrTemplateHeader } from '@tanstack/react-table';
import {
  DbTrajectory,
  HypothesisRowData,
  TechnologyType,
  TrajectoryWithSubRowsType,
} from '@/shared/types/Trajectory.type.ts';
import { Dispatch, SetStateAction } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { TFunction } from 'i18next';
import { StudyDTO } from '@/shared/types/Study.type.ts';
import {
  HYDRO_PSP_TYPES,
  HYDRO_TYPES,
  NUCLEAR_FR_MODULATION_TYPES,
  NUCLEAR_FR_TIME_SERIES_TYPES,
} from '@/shared/const/trajectoryTypes.ts';
import { DropdownItemProps } from '@design-system-rte/core/components/dropdown/dropdown.interface';

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type WithNullableFields<T, Fields> = {
  [K in keyof T]: K extends Fields ? T[K] | null | undefined : T[K];
};

export interface ErrorMessageType {
  index: number;
  message: string;
}

export interface BackendError {
  antaresErrorMessage: string;
  errorMessageArguments: string[];
  date: Date;
  type: ERROR_MESSAGE_TYPE;
}

export class TrajectoryBackendError extends Error {
  constructor(message: string, originalError: unknown) {
    super(message);
    this.name = 'TrajectoryBackendError';
    if (originalError instanceof Error) {
      this.stack += '\nCaused by: ' + originalError.stack;
    }
  }
}

export type ColumnProps<TData> = (
  | (AccessorKeyColumnDefBase<HypothesisRowData, string extends DeepKeys<TData> ? DeepValue<TData, string> : never> & {
      id?: string;
      header?: StringOrTemplateHeader<
        HypothesisRowData,
        string extends DeepKeys<TData> ? DeepValue<TData, string> : never
      >;
    })
  | (AccessorKeyColumnDefBase<HypothesisRowData, string extends DeepKeys<TData> ? DeepValue<TData, string> : never> & {
      header?: string;
      id?: string;
    })
)[];

export type CheckBoxData = {
  name: string;
  isDefault: boolean;
};

export const AnchorDefaultAsType = 'a';

export type FileInputStatus = 'success' | 'error' | 'loading' | 'empty' | 'emptyError';

export type ExpandedState = true | Record<string, boolean>;

export interface TabProps {
  studyData: StudyDTO;
}

export type TableHeadersProps = {
  isStudyGenerated: boolean;
  progress: number;
  fileStatus: FileInputStatus;
  idSelected: string;
  columnHeader?: string;
  type?: TRAJECTORY_TYPE;
  list?: string[];
};

export interface TableHeadersGetterProps extends TableHeadersProps {
  t: TFunction<'translation', undefined>;
  errorInfo: ErrorMessageType;
  setErrorInfo: Dispatch<SetStateAction<ErrorMessageType>>;
}

export const isTrajectorySubrowsType = (value: unknown): value is TrajectoryWithSubRowsType =>
  [
    TRAJECTORY_TYPE.THERMAL_CAPACITY,
    TRAJECTORY_TYPE.STS,
    TRAJECTORY_TYPE.RES_CAPACITY,
    TRAJECTORY_TYPE.RES_LOAD,
    TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION,
    TRAJECTORY_TYPE.HYDRO_SERIES,
    TRAJECTORY_TYPE.HYDRO_PSP_SERIES,
  ].includes(value as TrajectoryWithSubRowsType);

export const isTrajectoryResType = (value: unknown): value is TrajectoryWithSubRowsType =>
  [
    TRAJECTORY_TYPE.RES_CAPACITY,
    TRAJECTORY_TYPE.RES_LOAD,
    TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION,
    TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION,
  ].includes(value as TrajectoryWithSubRowsType);

export const isTrajectoryHydroType = (value: unknown): value is TrajectoryWithSubRowsType =>
  [...HYDRO_TYPES, ...HYDRO_PSP_TYPES].includes(value as TrajectoryWithSubRowsType);

export const isTrajectoryHydroPSPType = (value: unknown): value is TrajectoryWithSubRowsType =>
  [TRAJECTORY_TYPE.HYDRO_PSP_SERIES, TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS].includes(
    value as TrajectoryWithSubRowsType,
  );

export const isTrajectoryNuclearType = (value: TRAJECTORY_TYPE) => NUCLEAR_FR_MODULATION_TYPES.includes(value);

export const isTrajectoryNuclearTSType = (value: TRAJECTORY_TYPE) => NUCLEAR_FR_TIME_SERIES_TYPES.includes(value);

export type TableOperationRow = 'empty' | 'remove';

export interface MenuProps {
  defaultAreas: { name: string }[];
  studyData: StudyDTO;
  type: TRAJECTORY_TYPE;
}

export interface FetchResult {
  trajType: TRAJECTORY_TYPE;
  trajectories: DbTrajectory[];
  dsrCmResult: DbTrajectory[] | null;
  technologies?: TechnologyType[] | null;
  shouldSkipFetch: boolean;
  contextTrajectories: DbTrajectory[];
}

export interface HypothesisTableResults extends FetchResult {
  rows: HypothesisRowData[];
  list?: {
    areaOptions: CheckBoxData[];
    checkedValues: string[];
  };
  readOnlyMap: Record<string, boolean>;
}

export interface DropdownItemOption extends DropdownItemProps {
  id?: string;
  value?: string
}