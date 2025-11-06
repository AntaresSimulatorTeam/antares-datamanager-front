import { RdsIconButton, RdsIconId } from 'rte-design-system-react';

interface LabelWithDeleteButtonProps {
  label: string;
  isDeletable: boolean;
  onClick?: () => void;
}

export const LabelWithDeleteButton = ({ label, isDeletable, onClick }: LabelWithDeleteButtonProps) => (
  <div className="flex h-full w-auto justify-start gap-2">
    <span className="text-gray-900">{label}</span>
    {isDeletable && <RdsIconButton icon={RdsIconId.Close} size="small" onClick={() => void onClick?.()} />}
  </div>
);
