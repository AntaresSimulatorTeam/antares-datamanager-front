import { useTranslation } from 'react-i18next';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { Icon } from '@design-system-rte/react';

interface CellWithStatusProps {
  status: TRAJECTORY_SELECTION_STATUS;
}

export const CellWithStatus = ({ status }: CellWithStatusProps) => {
  const { t } = useTranslation();

  const getIcon = (rowStatus: TRAJECTORY_SELECTION_STATUS) => {
    switch (rowStatus) {
      case TRAJECTORY_SELECTION_STATUS.OK:
        return (
          <>
            <Icon name="check" color="#058075" />
            {t('studyDetails.@import_status_done')}
          </>
        );
      case TRAJECTORY_SELECTION_STATUS.ERROR:
        return (
          <>
            <Icon name="info" color="#de0236" />
            <div className="flex items-center gap-2 text-error-700">{t('studyDetails.@import_status_error')}</div>
          </>
        );
      case TRAJECTORY_SELECTION_STATUS.MISSING:
      default:
        return (
          <>
            <Icon name="question-mark" color="#f38a3f" />
            {t('studyDetails.@import_status_missing')}
          </>
        );
    }
  };

  return <div className="flex items-center justify-start gap-1">{getIcon(status)}</div>;
};
