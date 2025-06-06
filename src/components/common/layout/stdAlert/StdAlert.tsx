import { useRdsId } from 'rte-design-system-react';
import { DisplayStatus } from '@/shared/types';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdIcon from '@common/base/stdIcon/StdIcon';
import StdButton from '../../base/stdButton/StdButton';
import { alertClassBuilder } from './alertClassBuilder';

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
  id?: string;
  status?: DisplayStatus;
  icon?: StdIconId;
  onClose?: () => void;
  action?: AlertAction;
}

const ICON_SIZE = 24;

const StdAlert = ({ message, id: propsId, status = 'info', icon, onClose, action }: StdAlertProps) => {
  const { containerClasses, iconClasses, textClasses } = alertClassBuilder(status);
  const id = useRdsId('alert', propsId);
  return (
    <div id={id} className={containerClasses} role="alert">
      <div className={iconClasses}>
        <StdIcon name={icon ?? DEFAULT_ICON[status]} width={ICON_SIZE} height={ICON_SIZE} />
      </div>
      <span className={textClasses}>{message}</span>
      <div className="flex min-w-fit items-center gap-1">
        {action && (
          <StdButton
            variant="transparent"
            onClick={action.onClick}
            size="small"
            color="secondary"
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
