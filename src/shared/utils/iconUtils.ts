import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

export const getStatusIcon = (status: StudyStatus) => {
  switch (status) {
    case StudyStatus.GENERATED:
      return { icon: StdIconId.PublishedWithChanges, color: 'success-800' };
    case StudyStatus.ERROR:
      return { icon: StdIconId.SyncProblem, color: 'error-800' };
    case StudyStatus.IN_PROGRESS:
    default:
      return { icon: StdIconId.Sync, color: 'info-800' };
  }
};
