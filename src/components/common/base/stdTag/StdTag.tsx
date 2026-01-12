import { useStdId } from '@/hooks/useStdId';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { tagClassBuilder } from './tagClassBuilder';
import StdIconButton from '@common/base/stdIconButton/StdIconButton.tsx';

export type StdTagProps = {
  id?: string;
  label: string;
  onDelete?: () => void;
};

const StdTag = ({ id: propsId, label, onDelete }: StdTagProps) => {
  const tagClasses = tagClassBuilder(!!onDelete);
  const id = useStdId('tag', propsId);

  return (
    <span className={tagClasses} id={id} role="listitem">
      <label className="overflow-hidden text-ellipsis whitespace-pre text-overnote text-gray-700">{label}</label>
      {onDelete && (
        <span className="px-0.25">
          <StdIconButton icon={StdIconId.Close} onClick={onDelete} size="extraSmall" variant="danger" />
        </span>
      )}
    </span>
  );
};

export default StdTag;
