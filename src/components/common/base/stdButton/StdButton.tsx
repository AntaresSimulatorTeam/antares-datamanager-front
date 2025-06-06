import { useRdsId } from 'rte-design-system-react';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdIcon from '@common/base/stdIcon/StdIcon';
import { Ref } from 'react';
import { buttonClassBuilder, labelClassBuilder } from './buttonClassBuilder';

export type ButtonVariant = 'contained' | 'outlined' | 'dashed' | 'text' | 'transparent';
export type ButtonSize = 'extraSmall' | 'small' | 'medium';
export type ButtonColor = 'primary' | 'secondary' | 'danger';
export type IconPosition = 'left' | 'right';

export type StdButtonProps = {
  label?: string;
  disabled?: boolean;
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  onKeydown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  id?: string;
  icon?: StdIconId;
  position?: IconPosition;
  ref?: Ref<HTMLButtonElement>;
};

const ICON_SIZE: Record<ButtonSize, number> = {
  extraSmall: 16,
  small: 20,
  medium: 20,
};

const StdButton = ({
  label,
  disabled = false,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  onClick = () => {},
  onKeydown = () => {},
  id: propsId,
  icon,
  position = 'left',
  ref,
}: StdButtonProps) => {
  const buttonClasses = buttonClassBuilder(variant, color, size, disabled, !!label);
  const labelClasses = label && labelClassBuilder(size);

  const id = useRdsId('btn', propsId);

  return (
    <button
      ref={ref}
      aria-label={icon}
      name={icon}
      disabled={disabled}
      className={buttonClasses}
      onClick={(e) => void onClick(e)}
      onKeyDown={onKeydown}
      id={id}
    >
      {icon && position === 'left' && <StdIcon name={icon} width={ICON_SIZE[size]} height={ICON_SIZE[size]} />}
      {label && <span className={labelClasses}>{label}</span>}
      {icon && position === 'right' && <StdIcon name={icon} width={ICON_SIZE[size]} height={ICON_SIZE[size]} />}
    </button>
  );
};

export default StdButton;
