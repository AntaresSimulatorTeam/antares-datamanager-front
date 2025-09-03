import { useStdId } from '@/hooks/useStdId';
import { TailwindUtilityColorClass } from '@/shared/types';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdIcon from '@common/base/stdIcon/StdIcon';
import { RotationOptionsType } from '../stdIcon/Icon';
import { iconButtonClassBuilder } from './iconButtonClassBuilder';

export type IconButtonVariant = 'default' | 'danger' | 'white'; // White is temporary. Will be removed once the good one is designed
export type IconButtonSize = 'extraSmall' | 'small' | 'medium';

export interface StdIconButtonProps {
  icon: StdIconId;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  disabled?: boolean;
  id?: string;
  color?: TailwindUtilityColorClass<'text'>;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  rotationOptions?: RotationOptionsType;
  rotate?: boolean;
  appearEffect?: boolean;
}

const ICON_SIZE: Record<IconButtonSize, number> = {
  extraSmall: 12,
  small: 16,
  medium: 20,
};

const StdIconButton = ({
  icon,
  size = 'medium',
  variant = 'default',
  disabled = false,
  id: propsId,
  color,
  onClick,
  rotationOptions,
  rotate,
  appearEffect = false,
}: StdIconButtonProps) => {
  const iconButtonClasses = iconButtonClassBuilder(variant, disabled, appearEffect);
  const id = useStdId('icon-btn', propsId);

  return (
    <button className={iconButtonClasses} disabled={disabled} onClick={onClick} id={id} aria-label={icon}>
      <StdIcon
        name={icon}
        width={ICON_SIZE[size]}
        height={ICON_SIZE[size]}
        color={color}
        rotationOptions={rotationOptions}
        rotate={rotate}
      />
    </button>
  );
};

export default StdIconButton;
