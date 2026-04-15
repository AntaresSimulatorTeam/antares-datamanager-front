import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';
import { AccessorKeyColumnDefBase, DeepKeys, DeepValue, StringOrTemplateHeader } from '@tanstack/react-table';
import { HypothesisRowData, TrajectoryAreaData, TrajectoryWithSubRowsType } from '@/shared/types/Trajectory.type.ts';
import { Dispatch, SetStateAction } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { TFunction } from 'i18next';
import { StudyDTO } from '@/shared/types/Study.type.ts';

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
  defaultAreas: { name: string }[];
  areas: TrajectoryAreaData[];
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
  ].includes(value as TrajectoryWithSubRowsType);

export const isTrajectoryResType = (value: unknown): value is TrajectoryWithSubRowsType =>
  [
    TRAJECTORY_TYPE.RES_CAPACITY,
    TRAJECTORY_TYPE.RES_LOAD,
    TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION,
    TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION,
  ].includes(value as TrajectoryWithSubRowsType);

export type TableOperationRow = 'empty' | 'remove';

export interface MenuProps {
  defaultAreas: { name: string }[];
  areas: TrajectoryAreaData[];
  studyData: StudyDTO;
  type: TRAJECTORY_TYPE;
}
