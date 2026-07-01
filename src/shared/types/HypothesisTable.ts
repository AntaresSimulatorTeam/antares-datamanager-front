import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { TableOperationRow } from '@/shared/types/Generic.type.ts';
import { TechnologyType } from '@/shared/types/Trajectory.type.ts';

export type HypothesisConfig = { type: TRAJECTORY_TYPE; labelKey: string; hvdc?: boolean };

export type HypothesisTableOptions = { withReadOnlyRow: boolean; isStudyGenerated: boolean };

export type ReadOnlyObject = Record<string | number, boolean>;

export type DsrUpdateResult<T> = {
  data: T[];
  computeReadOnly: (prevReadOnly: ReadOnlyObject) => ReadOnlyObject;
};

export interface TrajectorySearchParams {
  area?: string;
  technology?: string;
  fileNameContains?: string;
}

export type RowToDeleteProps = {
  index: number;
  value?: string;
  operation?: TableOperationRow;
};

export type HypothesisType = { area: string; technology?: string; isDefault?: boolean };

export interface SearchParams {
  area?: string;
  technology?: string;
  isLastIndex?: boolean;
  technologies?: TechnologyType[];
  fileNameContains?: string;
}
