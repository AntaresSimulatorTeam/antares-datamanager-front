import { clsx } from 'clsx';

export const WRAPPER_CLASSES = 'flex-col justify-start items-start inline-flex w-full h-full';

export const TEXT_CLASSES = 'px-0.5 py-0.25 text-body-s text-gray-700 inline-flex justify-between w-full';
export const HELPER_CLASSES =
  'text-left px-1 text-body-s text-gray-700 w-full overflow-hidden whitespace-nowrap text-ellipsis';

export const COMMON_VARIANT_CLASSES =
  'border-gray-400 rounded h-full px-2 py-1 w-full outline-none border inline-flex resize-y self-stretch bg-gray-w hover:bg-gray-50 focus:border-primary-600';

export const VARIANT_DISABLED_CLASSES =
  '[&]:bg-gray-100 [&]:hover:bg-gray-100 [&]:text-gray-500 [&]:cursor-not-allowed';

export const ERROR_CLASSES = {
  text: '[&&]:text-error-600',
  input: '[&]:border-error-600',
};

export const getMaxHeightClass = (maxHeight: number) => `max-h-${maxHeight}`;

export const inputTextAreaClassBuilder = (disabled: boolean, error: boolean, maxHeight?: number) => ({
  wrapperClasses: clsx(WRAPPER_CLASSES),
  labelClasses: clsx(TEXT_CLASSES, error && ERROR_CLASSES.text),
  inputClasses: clsx(
    COMMON_VARIANT_CLASSES,
    disabled && VARIANT_DISABLED_CLASSES,
    error && ERROR_CLASSES.input,
    maxHeight && getMaxHeightClass(maxHeight),
  ),
  helperClasses: clsx(HELPER_CLASSES, error && ERROR_CLASSES.text),
});
