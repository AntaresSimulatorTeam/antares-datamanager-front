import { useStdId } from '@/hooks/useStdId';
import { dismissToast } from '@/shared/notification/notification';
import { type DisplayStatus, NotificationActionClickOrWrapper } from '@/shared/types';
import { type ReactElement } from 'react';
import { StdNotificationAction } from '../stdNotificationAction/StdNotificationAction';
import { toastClassBuilder } from './toastClassBuilder';
import { Button } from '@design-system-rte/react';

export type ToastAction = NotificationActionClickOrWrapper;

export type StdToastProps = {
  message: string | ReactElement;
  id?: string;
  status?: DisplayStatus;
  action?: ToastAction;
  onClose?: () => void;
  progressBarPlaceholder?: boolean;
  toastId?: string | number;
};

const StdToast = ({
  message,
  id: propsId,
  toastId,
  status = 'info',
  action,
  onClose,
  progressBarPlaceholder = false,
}: StdToastProps) => {
  const { containerClasses, textClasses } = toastClassBuilder(status, progressBarPlaceholder);
  const id = useStdId('toast', propsId);
  return (
    <div id={id} className={containerClasses} role="alert">
      <span className={textClasses}>{message}</span>
      <div className="flex min-w-fit items-center gap-1">
        <StdNotificationAction action={action} toastId={toastId} dismissNotification={dismissToast} />
        {onClose && <Button label="" icon="close" onClick={onClose} variant="text" />}
      </div>
    </div>
  );
};

export default StdToast;
