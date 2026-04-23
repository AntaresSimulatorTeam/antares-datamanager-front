import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { TagProps as TagPropsCore, TagStatus } from '@design-system-rte/core/components/tag/tag.interface';

export const getStatusIcon = (status: StudyStatus): { icon: Pick<TagPropsCore, 'iconName'>; tagStatus: TagStatus } => {
  switch (status) {
    case StudyStatus.GENERATED:
      return { icon: 'publish' as Pick<TagPropsCore, 'iconName'>, tagStatus: 'success' };
    case StudyStatus.ERROR:
      return { icon: 'error' as Pick<TagPropsCore, 'iconName'>, tagStatus: 'alert' };
    case StudyStatus.IN_PROGRESS:
    default:
      return { icon: 'swap-vert' as Pick<TagPropsCore, 'iconName'>, tagStatus: 'information' };
  }
};
