import { DisplayStatus } from '@/shared/types';
import { alertClassBuilder } from './alertClassBuilder';
import { useState } from 'react';
import { Button, Icon, IconButton } from '@design-system-rte/react';
import { useStdId } from '@/hooks/useStdId.ts';

const DEFAULT_ICON = {
  success: 'check',
  error: 'dangerous',
  warning: 'warning',
  info: 'error',
};

export interface AlertAction {
  label: string;
  onClick: () => void;
}

export interface StdAlertProps {
  message: string;
  content?: string;
  id?: string;
  status?: DisplayStatus;
  icon?: string;
  onClose?: () => void;
  action?: AlertAction;
  filledIcon?: boolean;
}

const ICON_SIZE = 20;

const StdAlert = ({
  message,
  id: propsId,
  status = 'info',
  icon,
  onClose,
  action,
  filledIcon,
  content,
}: StdAlertProps) => {
  const id = useStdId('alert', propsId);
  const [expanded, setExpanded] = useState(false);
  const { containerClasses, iconClasses, textClasses } = alertClassBuilder(status, filledIcon);

  return (
    <div
      id={id}
      className={`${containerClasses} ${expanded ? 'items-start' : 'items-center'} justify-between`}
      role="alert"
    >
      <div className={`flex ${expanded ? 'items-start' : 'items-center'} justify-start gap-2`}>
        <div className={iconClasses}>
          <Icon name={icon ?? DEFAULT_ICON[status]} size={ICON_SIZE} />
        </div>
        <div className="flex flex-col items-start gap-1 text-left">
          <span className={`${textClasses} ${expanded ? 'line-clamp-none' : 'line-clamp-1'}`}>{message}</span>
          {expanded && content && content?.length > 0 && (
            <div className="grow text-body-xs text-gray-700">{content}</div>
          )}
        </div>
      </div>
      <div className="flex min-w-fit items-center gap-1">
        <IconButton
          variant="text"
          onClick={() => setExpanded((prev) => !prev)}
          name={expanded ? 'arrow-chevron-up' : 'arrow-chevron-down'}
          size="s"
        />
        {action && (
          <Button
            variant="text"
            onClick={action.onClick}
            size="s"
            color={status === 'error' ? 'danger' : 'secondary'}
            label={action.label}
            aria-label={action.label}
          />
        )}
        {onClose && <IconButton variant="text" onClick={onClose} size="s" name="close" aria-label="Close" />}
      </div>
    </div>
  );
};

export default StdAlert;
