import clsx from 'clsx';
import { type TagColor } from './StdTag';

export const COMMON_CLASSES = 'flex h-2.5 max-w-fit items-center rounded-sm p-1 gap-0.5';

export const UTILITY_CLASSES = 'std-tag';

export const LABEL_CLASSES = 'text-overnote overflow-hidden text-ellipsis whitespace-pre pt-0.25';

// TODO: Colors do not exactly match Figma's. Check with UX to update our config colors.

export const COLOR_CLASSES = {
  primary: 'bg-primary-600 text-gray-w',
  secondary: 'bg-acc3-300 text-gray-w',
  neutral: 'bg-gray-200',
  success: 'bg-success-800 text-gray-w',
  danger: 'bg-error-700 text-gray-w',
  info: 'bg-info-600 text-gray-w',
};

export const tagClassBuilder = (color: TagColor, isClosable?: boolean) => ({
  containerClasses: clsx(COMMON_CLASSES, UTILITY_CLASSES, COLOR_CLASSES[color], isClosable ? 'pl-0.5' : 'px-0.5'),
  labelClasses: LABEL_CLASSES,
});
