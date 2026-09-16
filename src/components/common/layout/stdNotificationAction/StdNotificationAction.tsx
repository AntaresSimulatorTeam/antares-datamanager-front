import { hasOnClick, hasWrapper, type NotificationActionClickOrWrapper } from '@/shared/types';
import { Button } from '@design-system-rte/react';

export type StdNotificationActionProps = {
  action?: NotificationActionClickOrWrapper;
  toastId?: string | number;
  dismissNotification: (id: string | number) => void;
};

export const StdNotificationAction = ({ action, toastId, dismissNotification }: StdNotificationActionProps) => {
  if (hasOnClick(action)) {
    const handleClickDismiss = async () => {
      if (toastId) {
        dismissNotification(toastId);
      }
      await action.onClick();
    };
    return (
      <Button
        onClick={() => void handleClickDismiss}
        variant="transparent"
        size="s"
        color="secondary"
        label={action.label}
        aria-label={action.label}
      />
    );
  }
  if (hasWrapper(action)) {
    const handleClickDismiss = (onClick: () => void | Promise<void>) => async () => {
      if (toastId) {
        dismissNotification(toastId);
      }
      await onClick();
    };
    return action.actionButtonWrapper({
      renderButton: (renderProps) => (
        <Button
          onClick={() => void handleClickDismiss(renderProps.onClick)}
          variant="transparent"
          size="s"
          color="secondary"
          label={renderProps.label}
          aria-label={renderProps.label}
        />
      ),
    });
  }
  return null;
};
