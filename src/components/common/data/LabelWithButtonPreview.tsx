import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { ButtonPreview } from '@/components/button/ButtonPreview.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

interface LabelWithButtonPreviewProps {
  value: string;
  status: TRAJECTORY_SELECTION_STATUS;
  isReadOnly: boolean;
  extraValue: string;
  onClick?: () => void;
  hasPreview?: boolean;
  alignment?: string;
}

export const LabelWithButtonPreview = ({
  value,
  status,
  isReadOnly,
  extraValue,
  onClick,
  hasPreview = true,
  alignment = '',
}: LabelWithButtonPreviewProps) => (
  <div className={`${alignment}`}>
    <span className={`${status === TRAJECTORY_SELECTION_STATUS.OK ? 'text-primary-800' : 'text-gray-900'}`}>
      {`${value} ${extraValue}`}
    </span>
    {hasPreview && (
      <ButtonPreview
        label={'View'}
        icon={StdIconId.Preview}
        position={'left'}
        color={isReadOnly ? 'gray-700' : 'primary-800'}
        borderColor={isReadOnly ? 'gray-700' : 'acc1-800'}
        onClick={() => void onClick?.()}
      />
    )}
  </div>
);
