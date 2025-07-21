import { useRdsId } from 'rte-design-system-react';
import { DisplayStatus } from '@/shared/types';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdIcon from '@common/base/stdIcon/StdIcon';
import StdButton from '../../base/stdButton/StdButton';
import { alertClassBuilder } from './alertClassBuilder';
import { useState } from 'react';

const DEFAULT_ICON = {
  success: StdIconId.Done,
  error: StdIconId.Report,
  warning: StdIconId.Warning,
  info: StdIconId.Info,
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
  icon?: StdIconId;
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
  const { containerClasses, iconClasses, textClasses } = alertClassBuilder(status, filledIcon);
  const id = useRdsId('alert', propsId);
  const [open, setOpen] = useState(false);

  return (
    <div id={id} className={`${containerClasses} ${open ? 'items-start' : 'items-center'}`} role="alert">
      <div className={iconClasses}>
        <StdIcon name={icon ?? DEFAULT_ICON[status]} width={ICON_SIZE} height={ICON_SIZE} />
      </div>
      <div className={`flex cursor-pointer flex-col items-start gap-1 text-left`} onClick={() => setOpen(!open)}>
        <span className={textClasses}>{message}</span>
        {open && <div className="grow text-body-s font-normal text-gray-900">{content}</div>}
      </div>
      <div className="flex min-w-fit items-center gap-1">
        {action && (
          <StdButton
            variant="outlined"
            onClick={action.onClick}
            size="small"
            color={status === 'error' ? 'danger' : 'secondary'}
            label={action.label}
            aria-label={action.label}
          />
        )}
        {onClose && (
          <StdButton
            variant="transparent"
            onClick={onClose}
            size="small"
            color="secondary"
            icon={StdIconId.Close}
            aria-label="Close"
          />
        )}
      </div>
    </div>
  );
};

export default StdAlert;
