import { DisplayStatus } from '@/shared/types';
import { clsx } from 'clsx';

export const COMMON_CONTAINER_CLASSES = 'flex gap-2 rounded border-b-2 px-2 py-1 shadow-4 text-left';

export const COMMON_TEXT_CLASSES = 'line-clamp-1 grow text-body-s font-normal text-gray-900';

export const STATUS_CONTAINER_CLASSES = {
  success: 'border-success-600',
  error: 'border-error-600',
  warning: 'border-warning-600',
  info: 'border-info-600',
};

export const STATUS_COLOR_CLASSES = {
  success: 'text-success-800',
  error: 'text-error-800',
  warning: 'text-warning-900',
  info: 'text-info-800',
};
export const STATUS_BG_COLOR_CLASSES = {
  success: 'bg-acc1-600 text-gray-w',
  error: 'bg-error-800 text-gray-w',
  warning: 'bg-acc6-600 text-gray-w',
  info: 'bg-acc3-800 text-gray-w',
};

const COMMON_ICON_CLASSES = 'my-0.75 rounded-full';

export const alertClassBuilder = (status: DisplayStatus, filledIcon = false) => ({
  containerClasses: clsx(COMMON_CONTAINER_CLASSES, STATUS_CONTAINER_CLASSES[status]),
  textClasses: clsx(COMMON_TEXT_CLASSES),
  iconClasses: clsx(COMMON_ICON_CLASSES, filledIcon ? STATUS_BG_COLOR_CLASSES[status] : STATUS_COLOR_CLASSES[status]),
});
