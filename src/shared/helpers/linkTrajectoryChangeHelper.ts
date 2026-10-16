import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { DbTrajectory, HypothesisRowData } from '@/shared/types';

export const hasSelectedFlowbasedTrajectory = (
  row?: HypothesisRowData,
): row is HypothesisRowData & { trajectory: DbTrajectory } =>
  row != null &&
  (row.status === TRAJECTORY_SELECTION_STATUS.OK || row.status === TRAJECTORY_SELECTION_STATUS.WARNING) &&
  row.trajectory?.type === TRAJECTORY_TYPE.FLOWBASED;

interface PerformLinkTrajectoryChangeParams {
  studyId: number;
  linkTrajectory: DbTrajectory;
  flowbasedTrajectory?: DbTrajectory | null;
  replacement?: DbTrajectory;
  detach: (studyId: number, trajectoryIds: number[]) => Promise<void>;
  resetStudyOptions: (studyId: number, hasFlowbasedTrajectory: boolean) => Promise<void>;
  associate: (studyId: number, trajectory: DbTrajectory) => Promise<DbTrajectory>;
  onDetached: () => void;
  onAssociationSucceeded: (trajectory: DbTrajectory) => void;
  onStudyOptionsResetError: (error: unknown) => void;
}

export const performLinkTrajectoryChange = async ({
  studyId,
  linkTrajectory,
  flowbasedTrajectory,
  replacement,
  detach,
  resetStudyOptions,
  associate,
  onDetached,
  onAssociationSucceeded,
  onStudyOptionsResetError,
}: PerformLinkTrajectoryChangeParams): Promise<void> => {
  await detach(studyId, [linkTrajectory.id, ...(flowbasedTrajectory ? [flowbasedTrajectory.id] : [])]);
  onDetached();

  try {
    await resetStudyOptions(studyId, Boolean(flowbasedTrajectory));
  } catch (error) {
    onStudyOptionsResetError(error);
  }

  if (replacement) {
    const linkedTrajectory = await associate(studyId, replacement);
    onAssociationSucceeded(linkedTrajectory);
  }
};
