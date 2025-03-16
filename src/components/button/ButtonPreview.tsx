import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdIcon from '@common/base/stdIcon/StdIcon';
import { MouseEvent } from 'react';

interface ButtonPreviewProps {
  label: string;
  icon: StdIconId;
  position: 'left' | 'right';
  color: string;
  borderColor: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const ButtonPreview = ({ label, icon, onClick, position, color, borderColor }: ButtonPreviewProps) => (
  <button
    className={`text-white inline-flex flex-row items-center rounded border-2 border-${borderColor} bg-gray-w px-0.5 text-center font-semibold`}
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    id="button-preview"
  >
    {icon && position === 'left' && <StdIcon name={StdIconId.Preview} color={`text-${color}`} />}
    {label && <span className={`text-${color}`}>{label}</span>}
    {icon && position === 'right' && <StdIcon name={StdIconId.Preview} color={`text-${color}`} />}
  </button>
);
