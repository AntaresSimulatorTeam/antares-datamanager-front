/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { clsx } from 'clsx';
import type { IconButtonVariant } from './StdIconButton';

export const COMMON_CLASSES = 'flex items-center bg-transparent rounded-sm';

export const FOCUS_CLASSES = 'focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray-900';

export const VARIANT_CLASSES = {
  default: 'text-gray-700 hover:text-gray-800',
  danger: 'text-gray-700 hover:bg-error-600 hover:text-gray-w',
  white: 'text-gray-w hover:text-gray-100', // Temporary variant. Will be removed once the good one is designed
};

export const APPEAR_EFFECT_CLASSES =
  'duration-50 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100';

export const VARIANT_CLASSES_DISABLED = 'text-gray-500 cursor-not-allowed pointer-events-none';

export const iconButtonClassBuilder = (variant: IconButtonVariant, disabled: boolean, appearEffect: boolean): string =>
  disabled
    ? clsx(COMMON_CLASSES, VARIANT_CLASSES_DISABLED)
    : clsx(COMMON_CLASSES, VARIANT_CLASSES[variant], FOCUS_CLASSES, appearEffect ? APPEAR_EFFECT_CLASSES : '');
