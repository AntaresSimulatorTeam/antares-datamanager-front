import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';
import { AccessorKeyColumnDefBase, DeepKeys, DeepValue, StringOrTemplateHeader } from '@tanstack/react-table';
import {
  DbTrajectory,
  HypothesisRowData,
  TechnologyType,
  TrajectoryAreaData,
  TrajectoryWithSubRowsType,
} from '@/shared/types/Trajectory.type.ts';
import { Dispatch, SetStateAction } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { TFunction } from 'i18next';
import { StudyDTO } from '@/shared/types/Study.type.ts';
import {
  AREA_LINK_ME_TYPES,
  CONFIGURATION_TYPES,
  DSR_TYPES,
  HYDRO_ME_TYPES,
  HYDRO_PSP_TYPES,
  HYDRO_TYPES,
  ME_TYPES,
  MISC_TYPES,
  NO_AREA_TYPES,
  NUCLEAR_FR_MODULATION_TYPES,
  NUCLEAR_FR_TIME_SERIES_TYPES,
  OTHER_ME_TYPES,
  OTHER_VECTOR_TYPES,
  P2G_TYPES,
  RES_CAPACITY_TYPES,
  RES_DISTRIBUTION_TYPES,
  RES_TYPES,
  THERMAL_TECHNICAL_PARAMETERS_TYPES,
  THERMAL_TYPES,
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
  defaultAreas?: { name: string }[];
  areas?: TrajectoryAreaData[];
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

/**
 * Determines if the provided type is classified as a technical parameter type
 * within the thermal trajectory category.
 *
 * @returns {boolean} Returns true if the type matches any of the defined
 * thermal technical parameter categories; otherwise, returns false.
 * @param value
 */
export const isTrajectoryThermalTechnicalParametersType = (value: TRAJECTORY_TYPE): boolean => THERMAL_TECHNICAL_PARAMETERS_TYPES.includes(value);

export const isTrajectoryThermalType = (value: TRAJECTORY_TYPE): boolean => THERMAL_TYPES.includes(value);

export const isTrajectoryDSRType = (value: TRAJECTORY_TYPE): boolean => DSR_TYPES.includes(value);

export const isTrajectoryMiscType = (value: TRAJECTORY_TYPE): boolean => MISC_TYPES.includes(value);

export const isTrajectoryResCapacityType = (value: TRAJECTORY_TYPE): boolean => RES_CAPACITY_TYPES.includes(value);

export const isTrajectoryResDistributionType =  (value: TRAJECTORY_TYPE): boolean => RES_DISTRIBUTION_TYPES.includes(value);

export const isTrajectoryResType = (value: unknown): value is TrajectoryWithSubRowsType => RES_TYPES.includes(value as TrajectoryWithSubRowsType);

export const isTrajectoryHydroType = (value: unknown): value is TrajectoryWithSubRowsType =>
  [...HYDRO_TYPES, ...HYDRO_PSP_TYPES].includes(value as TrajectoryWithSubRowsType);

export const isTrajectoryHydroNonPSPType = (value: unknown): value is TrajectoryWithSubRowsType =>
  HYDRO_TYPES.includes(
    value as TrajectoryWithSubRowsType,
  );

export const isTrajectoryHydroPSPType = (value: unknown): value is TrajectoryWithSubRowsType =>
  HYDRO_PSP_TYPES.includes(
    value as TrajectoryWithSubRowsType,
  );

export const isTrajectoryNuclearType = (value: TRAJECTORY_TYPE) => NUCLEAR_FR_MODULATION_TYPES.includes(value);

export const isTrajectoryNuclearTSType = (value: TRAJECTORY_TYPE) => NUCLEAR_FR_TIME_SERIES_TYPES.includes(value);

export const isTrajectoryOtherVectorType = (value: TRAJECTORY_TYPE) => OTHER_VECTOR_TYPES.includes(value);

export const isTrajectoryP2GType = (value: TRAJECTORY_TYPE) => P2G_TYPES.includes(value);

export const isTrajectoryAreaLinkMEType = (value: TRAJECTORY_TYPE) => AREA_LINK_ME_TYPES.includes(value);

export const isTrajectoryOtherMEType = (value: TRAJECTORY_TYPE) => OTHER_ME_TYPES.includes(value);

export const isTrajectoryMEType = (value: TRAJECTORY_TYPE) => ME_TYPES.includes(value);

export const isTrajectoryMEHydroType = (value: TRAJECTORY_TYPE) => HYDRO_ME_TYPES.includes(value);

export const isTrajectoryConfigurationType = (value: TRAJECTORY_TYPE) => CONFIGURATION_TYPES.includes(value);

export const hasNoAreaType = (value?: TRAJECTORY_TYPE) => value ? NO_AREA_TYPES.includes(value) : false;

export type TableOperationRow = 'empty' | 'remove';

export interface MenuProps {
  defaultAreas?: { name: string }[];
  studyData: StudyDTO;
  type: TRAJECTORY_TYPE;
  areas?: TrajectoryAreaData[];
}

export type TrajectoryType = TRAJECTORY_TYPE;

export interface FetchResult {
  trajType: TrajectoryType;
  trajectories: DbTrajectory[];
  dsrCmResult?: DbTrajectory[] | null;
  technologies?: TechnologyType[] | null;
  shouldSkipFetch?: boolean;
  contextTrajectories?: DbTrajectory[];
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