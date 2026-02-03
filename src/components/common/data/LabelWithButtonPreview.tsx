import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import StdButton from '@common/base/stdButton/StdButton.tsx';
import { useTranslation } from 'react-i18next';

interface LabelWithButtonPreviewProps {
  value: string;
  status: TRAJECTORY_SELECTION_STATUS;
  isReadOnly: boolean;
  extraValue?: string;
  onClick?: () => void;
  hasPreview?: boolean;
  alignment?: string;
  disabled?: boolean;
}

export const LabelWithButtonPreview = ({
  value,
  status,
  extraValue,
  onClick,
  hasPreview = true,
  alignment = '',
  disabled = false,
}: LabelWithButtonPreviewProps) => {
  const { t } = useTranslation();
  return (
    <div className={`${alignment ?? undefined} flex items-center justify-between gap-2`}>
      <span
        className={`${status === TRAJECTORY_SELECTION_STATUS.OK ? 'text-primary-800' : status === TRAJECTORY_SELECTION_STATUS.ERROR ? 'text-error-800' : 'text-gray-900'}`}
      >
        {`${value} ${extraValue ?? ''}`}
      </span>
      {hasPreview && (
        <StdButton
          label={t('studyDetails.@preview')}
          icon={StdIconId.Preview}
          position="left"
          onClick={() => void onClick?.()}
          disabled={disabled}
          variant="outlined"
          size="small"
        />
      )}
    </div>
  );
};
