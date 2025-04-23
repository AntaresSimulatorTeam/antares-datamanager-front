import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';

export type ButtonSize = 'extraSmall' | 'small' | 'medium';
export type IconPosition = 'left' | 'right';
export type ButtonColor = 'primary' | 'secondary' | 'danger' | 'warning';

interface ButtonWithStdIconProps {
  label: string;
  icon: StdIconId;
  position: IconPosition;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading?: boolean;
  size?: ButtonSize;
  color?: ButtonColor;
}

export const ButtonWithStdIcon = ({
  label,
  icon,
  onClick,
  position,
  disabled = false,
  isLoading = false,
  size = 'small',
  color = 'primary',
}: ButtonWithStdIconProps) => {
  const getColors = (mainColor: ButtonColor) => {
    switch (mainColor) {
      case 'secondary':
        return 'acc1-600';
      case 'danger':
        return 'text-error-700 border-error-700 hover:bg-error-700 active:bg-error-900';
      case 'warning':
        return 'text-warning-500 border-warning-500 hover:bg-warning-500 active:bg-warning-900';
      case 'primary':
      default:
        return 'border-acc1-600 bg-acc1-600';
    }
  };

  const getIconColor = (mainColor: ButtonColor) => {
    switch (mainColor) {
      case 'secondary':
        return 'acc1-600';
      case 'danger':
        return 'text-error-700 hover:text-gray-w active:text-gray-w';
      case 'warning':
        return 'text-warning-500 hover:text-gray-w active:text-gray-w';
      case 'primary':
      default:
        return 'text-acc1-600';
    }
  };
  const getButtonLabel = () => {
    if (isLoading) {
      return (
        <div className="max-h-3 min-w-12">
          <div className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-600 border-b-transparent p-0"></div>
        </div>
      );
    } else {
      return (
        <div className={`flex items-center ${disabled ? 'text-gray-700' : getIconColor(color)}`}>
          {icon && position === 'left' && <StdIcon name={icon} />}
          {label && <p>{label}</p>}
          {icon && position === 'right' && <StdIcon name={icon} />}
        </div>
      );
    }
  };

  return (
    <button
      className={`inline-flex flex-row items-center gap-1 rounded border-2 ${size === 'medium' ? 'text-body-m' : size === 'small' ? 'text-body-s' : 'text-body-xs'} ${size === 'medium' ? 'p-2' : size === 'small' ? 'p-1' : 'px-0.5 py-0'} ${disabled ? 'border-gray-400 bg-gray-400' : getColors(color)} text-center`}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      id="button-generate"
      disabled={disabled || isLoading}
    >
      {getButtonLabel()}
    </button>
  );
};
