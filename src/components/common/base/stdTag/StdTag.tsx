import { useStdId } from '@/hooks/useStdId';
import { tagClassBuilder } from './tagClassBuilder';
import { Icon, IconButton } from '@design-system-rte/react';

export type TagColor = 'primary' | 'secondary' | 'neutral' | 'success' | 'danger' | 'info';

export type StdTagProps = {
  label: string;
  id?: string;
  color?: TagColor;
  onDelete?: () => void;
  icon?: string;
};

const StdTag = ({ id: propsId, label, color = 'neutral', onDelete, icon }: StdTagProps) => {
  const { containerClasses, labelClasses } = tagClassBuilder(color, !!onDelete);
  const id = useStdId('tag', propsId);

  return (
    <span className={containerClasses} id={id} role="listitem">
      {icon && <Icon name={icon} />}
      <label className={labelClasses}>{label}</label>
      {onDelete && (
        <span className="px-0.25">
          <IconButton name="close" onClick={onDelete} size="s" variant="danger" />
        </span>
      )}
    </span>
  );
};

export default StdTag;
