import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

export type HypothesisConfig = { type: TRAJECTORY_TYPE; labelKey: string };

export type HypothesisTableOptions = { withReadOnlyRow: boolean; isStudyGenerated: boolean };
