import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';

interface ButtonWithStdIconProps {
  label: string;
  icon: StdIconId;
  position: 'left' | 'right';
  disabled: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading: boolean;
}

export const ButtonWithStdIcon = ({ label, icon, onClick, position, disabled, isLoading }: ButtonWithStdIconProps) => {
  const getButtonLabel = () => {
    if (isLoading) {
      return (
        <div className={'max-h-3 min-w-12'}>
          <div
            className={
              'inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-600 border-b-transparent p-0'
            }
          ></div>
        </div>
      );
    } else {
      return (
        <>
          {icon && position === 'left' && <StdIcon name={icon} color={`${disabled ? 'gray-700' : 'gray-w'}`} />}
          {label && <span className={`${disabled ? 'text-gray-700' : 'text-gray-w'}`}>{label}</span>}
          {icon && position === 'right' && (
            <StdIcon name={icon} color={`${disabled ? 'text-gray-700' : 'text-gray-w'}`} />
          )}
        </>
      );
    }
  };
  return (
    <button
      className={`inline-flex flex-row items-center gap-1 rounded border-2 p-1 ${disabled ? 'border-gray-400' : 'border-acc1-600'} ${disabled ? 'bg-gray-400' : 'bg-acc1-600'} text-center font-normal`}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      id="button-generate"
      disabled={disabled || isLoading}
    >
      {getButtonLabel()}
    </button>
  );
};
