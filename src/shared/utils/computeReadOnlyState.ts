import { TRAJECTORY_SELECTION_STATUS } from "@/shared/enum/trajectory";
import { DbTrajectory } from '@/shared/types';
import { StudyStatus } from "@/shared/types/common/StudyStatus.type";

export const computeReadOnlyState = (
    areaTrajectory: DbTrajectory | null,
    areaStatus: TRAJECTORY_SELECTION_STATUS,
    studyStatus: StudyStatus,
    hasLinkTrajectory: boolean,
  ): Record<string, boolean> => ({
    '0': false,
    '1':
      !areaTrajectory ||
      areaStatus === TRAJECTORY_SELECTION_STATUS.ERROR ||
      (!hasLinkTrajectory && studyStatus === StudyStatus.GENERATED),
  });