import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { Button } from '@design-system-rte/react';
import { buildLabelColorClass } from '@/shared/utils/tailwindClass.ts';

interface LabelWithButtonPreviewProps {
  value: string;
  status: TRAJECTORY_SELECTION_STATUS;
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

  const colorLabel = buildLabelColorClass(status);

  return (
    <div className={`${alignment ?? undefined} flex items-center justify-between gap-2`}>
      <span className={colorLabel}>{`${value} ${extraValue ?? ''}`}</span>
      {hasPreview && (
        <Button
          label={t('studyDetails.@preview')}
          onClick={() => onClick?.()}
          hierarchy="secondary"
          disabled={disabled}
          icon="visibility-show"
          iconAppearance="filled"
          size="s"
        />
      )}
    </div>
  );
};
