import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import Icon from '@common/base/stdIcon/Icon.tsx';

interface ButtonPreviewProps {
  label: string;
  icon: StdIconId;
  position: 'left' | 'right';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  width?: number;
  height?: number;
}

export const ButtonPreview = ({ label, icon, onClick, width, height, position }: ButtonPreviewProps) => (
  <button
    className="text-white inline-flex flex-row items-center rounded border-2 border-acc1-600 px-0.5 text-center font-semibold"
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    id="button-preview"
    style={{ backgroundColor: '#fff' }}
  >
    {icon && position === 'left' && (
      <Icon width={width} height={height} name="preview" url={'/icons/common/preview.svg#icon'} />
    )}
    <svg xmlns="http://www.w3.org/2000/svg" role={'img'} className={'#7c9818'} width={width} height={height}>
      <title>{'preview'}</title>
      <use href={'/icons/common/preview.svg#icon'} fill="#7c9818" width={width} height={height} />
    </svg>
    <StdIcon color="#7c9818" name={icon} width={width} height={height} />
    {label && <span className="text-acc1-600">{label}</span>}
    {icon && position === 'right' && <StdIcon color="#7c9818" name={icon} width={width} height={width} />}
  </button>
);
