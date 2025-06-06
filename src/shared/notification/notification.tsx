/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Id, toast } from 'react-toastify';
import { RdsBanner, RdsToast, ToastAction } from 'rte-design-system-react';
import { v4 as uuidv4 } from 'uuid';
import { DisplayStatus } from '@/shared/types';

import { AlertContainerId, BannerContainerId, ToastContainerId } from './containers';
import StdAlert from '@common/layout/stdAlert/StdAlert.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

export type NotifyProps = {
  id?: string | number;
  message: string;
  type: DisplayStatus;
  icon?: StdIconId;
  filledIcon?: boolean;
};

export type NotifyWithActionProps = NotifyProps & {
  action?: ToastAction;
};

/**
 * Show a toast with a message, a type and an action
 * @returns The id of the toast
 */
export const notifyToast = ({ message, type, action, id }: NotifyWithActionProps) => {
  toast.clearWaitingQueue({ containerId: ToastContainerId });
  toast.dismiss({ containerId: ToastContainerId });
  const toastId = id ?? uuidv4();
  return toast(<RdsToast message={message} status={type} action={action} progressBarPlaceholder />, {
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
export const notifyAlert = ({ message, type, action, id, icon, filledIcon }: NotifyWithActionProps) => {
  const toastId = id ?? uuidv4();
  return toast(
    <StdAlert
      message={message}
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

/**
 * Dismiss alert with an id, or all alerts without an id
 */
export const dismissAlert = () => toast.dismiss({ containerId: AlertContainerId });

/**
 * Dismiss alert with an id, or all alerts without an id
 */
export const dismissBanner = (id?: Id) => toast.dismiss({ containerId: BannerContainerId, id });
/**
 * Show a banner with a message and a type
 * @returns The id of the banner
 */
export const notifyBanner = ({ message, type }: NotifyProps) => {
  toast.clearWaitingQueue({ containerId: BannerContainerId });
  toast.dismiss({ containerId: BannerContainerId });
  const toastId = uuidv4();
  return toast(<RdsBanner message={message} status={type} onClose={() => dismissBanner(toastId)} />, {
    containerId: BannerContainerId,
    toastId,
    type,
  });
};
