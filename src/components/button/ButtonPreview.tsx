import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';

interface ButtonPreviewProps {
  label: string;
  icon: StdIconId;
  position: 'left' | 'right';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ButtonPreview = ({ label, icon, onClick, position }: ButtonPreviewProps) => (
  <button
    className="text-white inline-flex flex-row items-center rounded border-2 border-acc1-600 bg-gray-w px-0.5 text-center font-semibold"
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    id="button-preview"
  >
    {icon && position === 'left' && <StdIcon name={StdIconId.Preview} color="text-acc1-600" />}
    {label && <span className="text-acc1-600">{label}</span>}
    {icon && position === 'right' && <StdIcon name={StdIconId.Preview} color="text-acc1-600" />}
  </button>
);
