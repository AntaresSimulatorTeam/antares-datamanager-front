/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { classMerger } from '@/shared/utils/common/classes/classMerger';
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
  primary: 'focus:outline focus:outline-1 focus:outline-offset-2 focus:outline-primary-900',
  secondary: 'focus:outline focus:outline-1 focus:outline-offset-2 focus:outline-gray-900',
  danger: 'focus:outline focus:outline-1 focus:outline-offset-2 focus:outline-gray-900',
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
    contained: 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-w border border-gray-200 border-opacity-0',
    outlined: 'bg-gray-w hover:bg-gray-50 active:bg-gray-100 text-gray-600 border border-gray-600',
    dashed: 'bg-transparent hover:bg-gray-50 active:bg-gray-100 text-gray-600 border-dashed border border-gray-600',
    text: 'bg-transparent hover:bg-gray-50 active:bg-gray-100 text-gray-600 border border-gray-200 border-opacity-0',
    transparent: 'bg-transparent hover:text-gray-700 active:text-gray-600 text-gray-900 border border-transparent',
  },
  danger: {
    contained: 'bg-error-700 hover:bg-error-800 active:bg-error-900 border border-gray-200 border-opacity-0',
    outlined: 'bg-gray-w hover:bg-error-50 active:bg-error-100 text-error-700 border border-error-700',
    dashed: 'bg-transparent hover:bg-error-50 active:bg-error-100 text-error-700 border-dashed border border-error-700',
    text: 'bg-transparent hover:bg-error-50 active:bg-error-100 text-error-700 border border-error-700 border-opacity-0',
    transparent: 'bg-transparent hover:text-gray-700 active:text-gray-600 text-gray-900 border border-transparent',
  },
};

export const VARIANT_CLASSES_DISABLED = {
  contained: 'bg-gray-200 text-gray-500 border border-gray-500 border-opacity-0 cursor-not-allowed',
  outlined: 'bg-gray-200 text-gray-500 border border-gray-500 cursor-not-allowed',
  dashed: 'bg-gray-200 text-gray-500 border-dashed border border-gray-500 cursor-not-allowed',
  text: 'bg-gray-200 text-gray-500 border border-gray-500 border-opacity-0 cursor-not-allowed',
  transparent: 'text-gray-500 border border-transparent cursor-not-allowed',
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
  const baseClasses = hasLabel ? COMMON_CLASSES : classMerger(COMMON_CLASSES, SINGLE_ICON_CLASSES[size]);

  if (disabled) {
    return classMerger(baseClasses, VARIANT_CLASSES_DISABLED[variant], SIZE_CLASSES[size]);
  }
  return classMerger(baseClasses, VARIANT_CLASSES[color][variant], FOCUS_CLASSES[color], SIZE_CLASSES[size]);
};

export function labelClassBuilder(size: ButtonSize) {
  return classMerger(LABEL_CLASSES_COMMON, LABEL_CLASSES_PADDING_SIZE[size]);
}
