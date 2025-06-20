import { clsx } from 'clsx';

export const COMMON_CHECKBOX_CLASSES =
  'box-content h-1.5 w-1.5 flex items-center rounded-xs border peer-checked:[&_.done-icon]:block checked:[&_.indeterminate-icon]:block';

export const CHECKED_CLASSES =
  'peer-checked:bg-primary-600 peer-checked:border-primary-600 group-hover:peer-checked:bg-primary-700 group-hover:peer-checked:border-primary-700 group-active:peer-checked:bg-primary-900 group-active:peer-checked:border-primary-900 peer-focus-visible:peer-checked:outline-primary-900 peer-focus-visible:peer-checked:outline-primary-900';
export const INDETERMINATE_CLASSES =
  'peer-indeterminate:bg-primary-600 peer-indeterminate:border-primary-600 group-hover:peer-indeterminate:bg-primary-700 group-hover:peer-indeterminate:border-primary-700 group-active:peer-indeterminate:bg-primary-900 group-active:peer-indeterminate:border-primary-900 focus-visible:peer-indeterminate:outline-primary-900';

export const DISABLED_CLASSES =
  'peer-checked:bg-gray-500 peer-checked:border-gray-500 peer-indeterminate:bg-gray-500 peer-indeterminate:border-gray-500';

export const OTHER_CHECKBOX_CLASSES = {
  enabled: clsx(
    'group-hover:shadow-1 group-active:shadow-2 border-gray-600 group-hover:bg-gray-200 group-active:bg-gray-300 peer-focus-visible:outline peer-focus-visible:outline-offset-1 peer-has-focus-visible:outline-1 outline-primary-900',
    CHECKED_CLASSES,
    INDETERMINATE_CLASSES,
  ),
  disabled: clsx('border-gray-500 bg-gray-200 text-gray-500 cursor-not-allowed', DISABLED_CLASSES),
};
export const ERROR_CLASSES =
  '[&]:border-error-600 peer-checked:[&]:border-error-600 outline-1 outline-offset-0 outline-error-600';
export const COMMON_LABEL_CLASSES = 'text-body-s select-none';
export const LABEL_TEXT_CLASSES = {
  enabled: 'text-gray-700 peer-checked:text-gray-900 peer-indeterminate:text-gray-900',
  disabled: 'text-gray-500',
};

export const ERROR_LABEL_TEXT_CLASS = 'text-error-600';

export const checkboxClassBuilder = (disabled: boolean, error: boolean) => {
  const disabledKey = disabled ? 'disabled' : 'enabled';

  return {
    containerClasses: clsx(
      'flex items-center gap-1 group w-full hover:bg-gray-200 focus:bg-primary-300 active:bg-gray-300',
      {
        'cursor-pointer': !disabled,
      },
    ),
    inputClasses: clsx(
      COMMON_CHECKBOX_CLASSES,
      OTHER_CHECKBOX_CLASSES[disabledKey],
      !disabled && error && ERROR_CLASSES,
    ),
    labelClasses: clsx(COMMON_LABEL_CLASSES, LABEL_TEXT_CLASSES[disabledKey], {
      [ERROR_LABEL_TEXT_CLASS]: error && !disabled,
    }),
  };
};
