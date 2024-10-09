/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { clsx } from 'clsx';
import type { TextVariant } from './StdInputText';

export const TEXT_CLASSES = 'px-0.5 py-0.25 text-body-s text-gray-700 inline-flex justify-between w-full';
export const HELPER_CLASSES = 'h-2 px-1 text-body-s text-gray-700';
export const CLEAR_CLASSES = 'outline-none border border-gray-w focus:rounded focus:border-primary-600';
export const INPUT_CLASSES =
  'w-full outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

export const COMMON_VARIANT_CLASSES = 'h-4 pl-2 pr-2 w-full outline-none border inline-flex';

export const VARIANT_CLASSES = {
  outlined: 'bg-gray-w hover:bg-gray-50 focus-within:border-primary-600 rounded border-gray-400',
  text: 'bg-gray-w hover:bg-gray-50 focus-within:border-b-primary-600 border-gray-w border-b-gray-400',
};
export const VARIANT_DISABLED_CLASSES = '[&]:bg-gray-100 hover:bg-gray-100 [&]:text-gray-500 [&]:cursor-not-allowed';

export const BUTTON_CLASSES = 'flex w-2.5 [&>button]:p-0';
export const HIDE_BUTTON_CLASSES = 'invisible';

export const ERROR_CLASSES = {
  text: '[&&]:text-error-600',
  input: {
    outlined: '[&]:border-error-600',
    text: '[&]:border-b-error-600',
  },
};

export const textClassBuilder = (variant: TextVariant, disabled: boolean, error: boolean, hideButton: boolean) => ({
  labelClasses: clsx(TEXT_CLASSES, error && ERROR_CLASSES.text),
  wrapperInputClasses: clsx(COMMON_VARIANT_CLASSES, VARIANT_CLASSES[variant]),
  inputClasses: clsx(INPUT_CLASSES, disabled && VARIANT_DISABLED_CLASSES, error && ERROR_CLASSES.input[variant]),
  helperClasses: clsx(HELPER_CLASSES, error && ERROR_CLASSES.text),
  clearClasses: clsx(CLEAR_CLASSES, disabled && VARIANT_DISABLED_CLASSES),
  buttonClasses: clsx(BUTTON_CLASSES, hideButton && HIDE_BUTTON_CLASSES),
});
