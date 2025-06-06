import { DisplayStatus } from '@/shared/types';
import { clsx } from 'clsx';

export const COMMON_CONTAINER_CLASSES = 'flex items-center gap-2 rounded border-b-2 px-2 py-1 shadow-4 text-left';

export const COMMON_TEXT_CLASSES = 'line-clamp-2 grow text-body-xs font-semibold';

export const STATUS_CONTAINER_CLASSES = {
  success: 'border-success-600 bg-success-200',
  error: 'border-error-600 bg-error-200',
  warning: 'border-warning-600 bg-warning-200',
  info: 'border-info-600 bg-info-200',
};

export const STATUS_COLOR_CLASSES = {
  success: 'text-success-800',
  error: 'text-error-800',
  warning: 'text-warning-900',
  info: 'text-info-800',
};

const COMMON_ICON_CLASSES = 'my-0.75';

export const alertClassBuilder = (status: DisplayStatus) => ({
  containerClasses: clsx(COMMON_CONTAINER_CLASSES, STATUS_CONTAINER_CLASSES[status]),
  textClasses: clsx(COMMON_TEXT_CLASSES, STATUS_COLOR_CLASSES[status]),
  iconClasses: clsx(COMMON_ICON_CLASSES, STATUS_COLOR_CLASSES[status]),
});
