import { RdsIcon, RdsIconButton, RdsIconId } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';

interface CellWithStatusProps {
  status: TRAJECTORY_SELECTION_STATUS;
  isDeletable: boolean;
  onClick?: () => void;
}

export const CellWithStatus = ({ status, isDeletable, onClick }: CellWithStatusProps) => {
  const { t } = useTranslation();

  const getIcon = (rowStatus: TRAJECTORY_SELECTION_STATUS) => {
    switch (rowStatus) {
      case TRAJECTORY_SELECTION_STATUS.OK:
        return (
          <>
            <RdsIcon name={RdsIconId.Done} color="primary-600" />
            {t('studyDetails.@import_status_done')}
          </>
        );
      case TRAJECTORY_SELECTION_STATUS.ERROR:
        return (
          <>
            <RdsIcon name={RdsIconId.Info} color="error-700" />
            <div className="flex items-center gap-2 text-error-700">{t('studyDetails.@import_status_error')}</div>
          </>
        );
      case TRAJECTORY_SELECTION_STATUS.MISSING:
      default:
        return (
          <>
            <StdIcon name={StdIconId.QuestionMark} color="text-warning-500" />
            {t('studyDetails.@import_status_missing')}
          </>
        );
    }
  };

  return (
    <div className="flex items-center justify-start gap-1">
      {getIcon(status)}
      <div className={`${isDeletable ? 'pointer-events-auto visible' : 'pointer-events-none invisible'}`}>
        <RdsIconButton icon={RdsIconId.Delete} size="small" onClick={() => onClick?.()} />
      </div>
    </div>
  );
};
