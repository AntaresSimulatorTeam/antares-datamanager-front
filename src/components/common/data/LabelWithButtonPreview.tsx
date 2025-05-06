import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { ButtonPreview } from '@/components/button/ButtonPreview.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

interface LabelWithButtonPreviewProps {
  value: string;
  status: TRAJECTORY_SELECTION_STATUS;
  isReadOnly: boolean;
  onClick?: () => void;
  hasPreview?: boolean;
}

export const LabelWithButtonPreview = ({
  value,
  status,
  isReadOnly,
  onClick,
  hasPreview = true,
}: LabelWithButtonPreviewProps) => (
  <div className={'flex w-2/3 items-center justify-between'}>
    <span className={`${status === TRAJECTORY_SELECTION_STATUS.OK ? 'text-primary-600' : 'text-gray-900'}`}>
      {value}
    </span>
    {hasPreview && (
      <ButtonPreview
        label={'View'}
        icon={StdIconId.Preview}
        position={'left'}
        color={isReadOnly ? 'gray-700' : 'primary-600'}
        borderColor={isReadOnly ? 'gray-700' : 'acc1-600'}
        onClick={() => void onClick?.()}
      />
    )}
  </div>
);
