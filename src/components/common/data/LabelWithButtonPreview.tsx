import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { Button } from '@design-system-rte/react';

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
  isReadOnly,
}: LabelWithButtonPreviewProps) => {
  const { t } = useTranslation();

  const colorLabel = `${status === TRAJECTORY_SELECTION_STATUS.OK ? 'text-primary-800' : isReadOnly ? 'text-gray-600' : status === TRAJECTORY_SELECTION_STATUS.ERROR ? 'text-error-800' : 'text-gray-900'}`;
  return (
    <div className={`${alignment ?? undefined} flex items-center justify-between gap-2`}>
      <span className={colorLabel}>{`${value} ${extraValue ?? ''}`}</span>
      {hasPreview && (
        <Button
          label={t('studyDetails.@preview')}
          onClick={() => void onClick?.()}
          variant="secondary"
          disabled={disabled}
          icon="visibility-show"
          iconAppearance="filled"
          size="s"
        />
      )}
    </div>
  );
};
