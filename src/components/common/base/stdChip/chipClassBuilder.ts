/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { clsx } from 'clsx';
import { MouseEventHandler } from 'react';
import { ChipStatus } from './StdChip';

export const COMMON_CLASSES =
  'active h-3 py-0.5 rounded-full font-semibold inline-flex gap-0.75 items-center align-middle border-2 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-gray-900 hover:shadow-2';

const COMMON_BORDER_CLASSES = 'border border-transparent';

const COMMON_LABEL_CLASSES = 'text-caption font-normal leading-none';

export const ACTIVE_CLASSES = {
  primary:
    'hover:bg-gray-300 hover:cursor-pointer active:border-primary-600 active:bg-gray-200 hover:text-gray-900 active:text-gray-900',
  secondary:
    'hover:bg-primary-200 hover:cursor-pointer active:border-primary-600 active:bg-primary-100 hover:text-primary-900 active:text-primary-900',
  success:
    'hover:bg-success-300 hover:cursor-pointer active:border-success-600 active:bg-success-200 hover:text-success-900 active:text-success-900',
  error:
    'hover:bg-error-200 hover:cursor-pointer active:border-error-600 active:bg-error-100 hover:text-error-900 active:text-error-900',
};

export const ACTIVE_KEYBOARD_CLASSES = {
  primary: 'bg-gray-200 border-primary-600',
  secondary: 'bg-primary-100 border-primary-600',
  success: ' bg-success-200 border-success-600',
  error: 'bg-error-100 border-error-600',
};

export const STATUS_CLASSES = {
  primary: 'bg-gray-200 text-gray-700',
  secondary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-100 text-success-700',
  error: 'bg-error-100 text-error-700',
};

const CLOSE_BUTTON_CLASSES =
  'align-center flex h-1.5 w-1.5 flex-col items-center justify-center text-gray-600 rounded-full hover:bg-gray-400 hover:text-gray-700 active:bg-gray-500 active:text-gray-800';

const FOCUS_CLOSE_BUTTON_CLASSES =
  'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-900 focus-visible:rounded';

export const PADDING_X = {
  paddingLeftWithoutIcon: 'pl-1.5',
  paddingLeftWithIcon: 'pl-0.75',
  paddingRightWithoutCloseButton: 'pr-1.5',
  paddingRightWithCloseButton: 'pr-0.5',
  paddingDefault: 'px-1.5',
};

const paddingChip = (label?: string, icon?: StdIconId, onClose?: MouseEventHandler<HTMLButtonElement>): string => {
  if (!onClose && ((icon && !label) || (!icon && label))) {
    return PADDING_X.paddingDefault;
  }
  const paddingLeft = icon ? PADDING_X.paddingLeftWithIcon : PADDING_X.paddingLeftWithoutIcon;
  const paddingRight = onClose ? PADDING_X.paddingRightWithCloseButton : PADDING_X.paddingRightWithoutCloseButton;
  return clsx(paddingLeft, paddingRight);
};

export const chipClassBuilder = (
  status: ChipStatus,
  isActive: boolean,
  label?: string,
  icon?: StdIconId,
  onClick?: (e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => void,
  onClose?: MouseEventHandler<HTMLButtonElement>,
) => ({
  chipClasses: clsx(
    COMMON_CLASSES,
    !isActive && COMMON_BORDER_CLASSES,
    !isActive && STATUS_CLASSES[status],
    onClick && ACTIVE_CLASSES[status],
    isActive && ACTIVE_KEYBOARD_CLASSES[status],
    paddingChip(label, icon, onClose),
  ),
  labelClasses: COMMON_LABEL_CLASSES,
  closeButtonClasses: clsx(CLOSE_BUTTON_CLASSES, FOCUS_CLOSE_BUTTON_CLASSES),
});
