import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

export type HypothesisConfig = { type: TRAJECTORY_TYPE; labelKey: string };

export type HypothesisTableOptions = { withReadOnlyRow: boolean; isStudyGenerated: boolean };

export type ReadOnlyObject = Record<string | number, boolean>;

export type DsrUpdateResult<T> = {
  data: T[];
  computeReadOnly: (prevReadOnly: ReadOnlyObject) => ReadOnlyObject;
};
