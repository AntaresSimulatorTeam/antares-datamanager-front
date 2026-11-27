import { DisplayStatus } from '@/shared/types';
import { clsx } from 'clsx';

export const COMMON_CONTAINER_CLASSES = 'flex gap-2 rounded border-b-2 px-2 py-1 shadow-4 text-left';

export const COMMON_TEXT_CLASSES = 'grow text-body-s text-content-primary';

export const STATUS_CONTAINER_CLASSES = {
  success: 'border-border-success',
  error: 'border-border-danger',
  warning: 'border-border-warning',
  info: 'border-border-info',
};

export const STATUS_COLOR_CLASSES = {
  success: 'text-content-success-default',
  error: 'text-content-danger-default',
  warning: 'text-border-warning',
  info: 'text-content-info-default',
};
export const STATUS_BG_COLOR_CLASSES = {
  success: 'bg-background-success-default text-content-primary-inverse',
  error: 'bg-background-danger-default text-content-primary-inverse',
  warning: 'bg-background-warning-default text-content-static',
  info: 'bg-background-info-default text-content-primary-inverse',
};

const COMMON_ICON_CLASSES = 'my-0.75 rounded-full';

export const alertClassBuilder = (status: DisplayStatus, filledIcon = false) => ({
  containerClasses: clsx(COMMON_CONTAINER_CLASSES, STATUS_CONTAINER_CLASSES[status]),
  textClasses: clsx(COMMON_TEXT_CLASSES),
  iconClasses: clsx(COMMON_ICON_CLASSES, filledIcon ? STATUS_BG_COLOR_CLASSES[status] : STATUS_COLOR_CLASSES[status]),
});
