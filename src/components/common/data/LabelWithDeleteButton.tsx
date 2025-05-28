import { RdsIconButton, RdsIconId } from 'rte-design-system-react';

interface LabelWithDeleteButtonProps {
  label: string;
  isDeletable: boolean;
  onClick?: () => void;
}

export const LabelWithDeleteButton = ({ label, isDeletable, onClick }: LabelWithDeleteButtonProps) => {
  const textClass = !isDeletable ? 'text-primary-600' : 'text-gray-900';
  return (
    <div className="flex h-full w-auto justify-start gap-2 py-2.5">
      <span className={`${textClass}`}>{label}</span>
      {isDeletable && <RdsIconButton icon={RdsIconId.Close} size="small" onClick={() => void onClick?.()} />}
    </div>
  );
};
