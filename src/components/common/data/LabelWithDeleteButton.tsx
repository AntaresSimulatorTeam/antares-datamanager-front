import { IconButton } from '@design-system-rte/react';

interface LabelWithDeleteButtonProps {
  label: string;
  isDeletable: boolean;
  onClick?: () => void;
}

export const LabelWithDeleteButton = ({ label, isDeletable, onClick }: LabelWithDeleteButtonProps) => (
  <div className="flex h-full w-auto justify-start gap-2">
    <span className="text-gray-900">{label}</span>
    {isDeletable && <IconButton variant="text" name="close" size="s" onClick={() => void onClick?.()} />}
  </div>
);
