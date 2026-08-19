/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { type Id, toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { DisplayStatus } from '@/shared/types';

import { AlertContainerId, ToastContainerId } from './containers';
import StdAlert, { AlertAction } from '@common/layout/stdAlert/StdAlert.tsx';
import StdToast from '@common/layout/stdToast/StdToast.tsx';

export type NotifyProps = {
  id?: string | number;
  message: string;
  type: DisplayStatus;
  icon?: string;
  filledIcon?: boolean;
};

export type NotifyWithActionProps = NotifyProps & {
  action?: AlertAction;
  content?: string;
};

/**
 * Show a toast with a message, a type and an action
 * @returns The id of the toast
 */
export const notifyToast = ({ message, type, action, id }: NotifyWithActionProps) => {
  toast.clearWaitingQueue({ containerId: ToastContainerId });
  toast.dismiss({ containerId: ToastContainerId });
  const toastId = id ?? uuidv4();
  return toast(<StdToast message={message} status={type} action={action} progressBarPlaceholder />, {
    toastId,
    containerId: ToastContainerId,
    type,
  });
};

/**
 * Dismiss toast with an id, or all toasts without an id
 */
export const dismissToast = (id?: Id) => toast.dismiss({ containerId: ToastContainerId, id });

/**
 * Show an alert with a message, a type and an action
 * @returns The id of the alert
 */
export const notifyAlert = ({ message, content, type, action, id, icon, filledIcon }: NotifyWithActionProps) => {
  const toastId = id ?? uuidv4();
  return toast(
    <StdAlert
      message={message}
      content={content}
      status={type}
      action={action}
      onClose={() => toast.dismiss(toastId)}
      icon={icon}
      filledIcon={filledIcon}
    />,
    {
      toastId,
      containerId: AlertContainerId,
      type,
    },
  );
};
