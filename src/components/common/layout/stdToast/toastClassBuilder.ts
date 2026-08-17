import { type DisplayStatus } from '@/shared/types';
import { clsx } from 'clsx';

export const COMMON_CONTAINER_CLASSES = 'flex items-center rounded px-2 py-1 shadow-4 text-left';
const PROGRESS_BAR_CLASSES = 'border-b-4';
export const COMMON_TEXT_CLASSES = 'grow text-body-xs line-clamp-2 pr-2 font-semibold';

export const STATUS_CONTAINER_CLASSES = {
  success: 'bg-success-200',
  error: 'bg-error-200',
  warning: 'bg-warning-200',
  info: 'bg-info-200',
};

export const STATUS_TEXT_CLASSES = {
  success: 'text-success-800',
  error: 'text-error-800',
  warning: 'text-warning-900',
  info: 'text-info-800',
};

export const toastClassBuilder = (status: DisplayStatus, progressBarPlaceholder: boolean) => ({
  iconClasses: STATUS_TEXT_CLASSES[status],
  containerClasses: progressBarPlaceholder
    ? clsx(COMMON_CONTAINER_CLASSES, STATUS_CONTAINER_CLASSES[status], PROGRESS_BAR_CLASSES)
    : clsx(COMMON_CONTAINER_CLASSES, STATUS_CONTAINER_CLASSES[status]),
  textClasses: clsx(COMMON_TEXT_CLASSES, STATUS_TEXT_CLASSES[status]),
});
