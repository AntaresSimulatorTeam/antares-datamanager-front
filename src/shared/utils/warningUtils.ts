import { CardDataType } from '@common/layout/CardWithIconTitle.tsx';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/trajectory.ts';
import { RdsIconId } from 'rte-design-system-react';

export const convertDataToItem = <T>(data: T, t: (key: string) => string): CardDataType => {
  const {
    level = WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    trajectory = null,
    secondTrajectory = null,
    content = null,
    generatedBy = null,
    generatedAt = null,
  } = data || {};

  const title =
    level === WARNING_MESSAGE_LEVEL.WARNING_LEVEL
      ? t('studyDetails.@import_status_warning')
      : t('studyDetails.@import_status_error');

  return {
    color: level === WARNING_MESSAGE_LEVEL.WARNING_LEVEL ? 'warning-700' : 'error-700',
    colorBorder: level === WARNING_MESSAGE_LEVEL.WARNING_LEVEL ? 'border-acc6-500' : 'border-acc4-700',
    icon: level === WARNING_MESSAGE_LEVEL.WARNING_LEVEL ? RdsIconId.Warning : RdsIconId.Info,
    title,
    subtitle: `${trajectory ?? ''} ${secondTrajectory ? ' - ' : ''} ${secondTrajectory || ''}`,
    content,
    generatedBy,
    generatedAt,
  };
};
