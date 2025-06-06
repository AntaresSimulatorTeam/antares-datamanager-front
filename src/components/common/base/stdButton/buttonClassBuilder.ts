import { clsx } from 'clsx';
import type { ButtonColor, ButtonSize, ButtonVariant } from './StdButton';

export const COMMON_CLASSES = 'rounded font-semibold text-center inline-flex flex-row items-center';

export const SIZE_CLASSES = {
  extraSmall: 'px-0.25 text-button-xs',
  small: 'px-0.5 py-0.25 text-button-s',
  medium: 'px-1 py-0.75 text-button-s',
};
export const SINGLE_ICON_CLASSES = {
  extraSmall: '[&]:px-0 [&]:py-0',
  small: '[&]:px-0.25',
  medium: '[&]:px-0.75',
};

export const FOCUS_CLASSES = {
  primary:
    'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-primary-900',
  secondary:
    'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-gray-900',
  danger: 'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-gray-900',
};

export const VARIANT_CLASSES = {
  primary: {
    contained:
      'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-gray-w border border-primary-600 border-opacity-0',
    outlined: 'bg-gray-w hover:bg-primary-50 active:bg-primary-100 text-primary-600 border border-primary-600',
    dashed:
      'bg-transparent hover:bg-primary-50 active:bg-primary-100 text-primary-600 border-dashed border border-primary-600',
    text: 'bg-transparent hover:bg-primary-50 active:bg-primary-100 text-primary-600 border border-primary-600 border-opacity-0',
    transparent:
      'bg-transparent hover:text-primary-700 active:text-primary-900 text-primary-600 border border-transparent',
  },
  secondary: {
    contained: 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 border border-gray-200 border-opacity-0',
    outlined: 'bg-gray-w hover:bg-gray-50 active:bg-gray-100 text-gray-600 border border-gray-600',
    dashed: 'bg-transparent hover:bg-gray-50 active:bg-gray-100 text-gray-600 border-dashed border border-gray-600',
    text: 'bg-transparent hover:bg-gray-50 active:bg-gray-100 text-gray-600 border border-gray-200 border-opacity-0',
    transparent: 'bg-transparent hover:text-gray-700 active:text-gray-600 text-gray-900 border border-transparent',
  },
  danger: {
    contained:
      'text-gray-w bg-error-700 hover:bg-error-800 active:bg-error-900 border border-gray-200 border-opacity-0',
    outlined: 'bg-gray-w hover:bg-error-50 active:bg-error-100 text-error-700 border border-error-700',
    dashed: 'bg-transparent hover:bg-error-50 active:bg-error-100 text-error-700 border-dashed border border-error-700',
    text: 'bg-transparent hover:bg-error-50 active:bg-error-100 text-error-700 border border-error-700 border-opacity-0',
    transparent: 'bg-transparent hover:text-gray-700 active:text-gray-600 text-gray-900 border border-transparent',
  },
};

export const VARIANT_CLASSES_DISABLED = {
  contained: 'bg-gray-200 text-gray-500 border border-gray-500 border-opacity-0 cursor-not-allowed pointer-events-none',
  outlined: 'bg-gray-200 text-gray-500 border border-gray-500 cursor-not-allowed pointer-events-none',
  dashed: 'bg-gray-200 text-gray-500 border-dashed border border-gray-500 cursor-not-allowed pointer-events-none',
  text: 'bg-gray-200 text-gray-500 border border-gray-500 border-opacity-0 cursor-not-allowed pointer-events-none',
  transparent: 'text-gray-500 border border-transparent cursor-not-allowed pointer-events-none',
};

export const LABEL_CLASSES_COMMON = 'inline-flex capitalize-first line-clamp-1 text-nowrap';
export const LABEL_CLASSES_PADDING_SIZE = {
  extraSmall: 'px-0.25 py-0.25',
  small: 'px-0.5 py-0.25',
  medium: 'px-1 py-0.25',
};

export const buttonClassBuilder = (
  variant: ButtonVariant,
  color: ButtonColor,
  size: ButtonSize,
  disabled: boolean,
  hasLabel: boolean,
): string => {
  const baseClasses = clsx(COMMON_CLASSES, !hasLabel && SINGLE_ICON_CLASSES[size], SIZE_CLASSES[size]);

  if (disabled) {
    return clsx(baseClasses, VARIANT_CLASSES_DISABLED[variant]);
  }
  return clsx(baseClasses, VARIANT_CLASSES[color][variant], FOCUS_CLASSES[color]);
};

export function labelClassBuilder(size: ButtonSize) {
  return clsx(LABEL_CLASSES_COMMON, LABEL_CLASSES_PADDING_SIZE[size]);
}
