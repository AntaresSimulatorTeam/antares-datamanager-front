/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { classMerger } from '@/shared/utils/common/classes/classMerger';
import type { IconButtonVariant } from './StdIconButton';

export const COMMON_CLASSES = 'flex items-center bg-transparent rounded-sm';

export const FOCUS_CLASSES = 'focus:outline focus:outline-1 focus:outline-gray-900';

export const VARIANT_CLASSES = {
  default: 'text-gray-700 hover:text-gray-800',
  danger: 'text-gray-700 hover:bg-error-600 hover:text-gray-w',
};

export const VARIANT_CLASSES_DISABLED = 'text-gray-500 cursor-not-allowed';

export const iconButtonClassBuilder = (variant: IconButtonVariant, disabled: boolean): string =>
  disabled
    ? classMerger(COMMON_CLASSES, VARIANT_CLASSES_DISABLED)
    : classMerger(COMMON_CLASSES, VARIANT_CLASSES[variant], FOCUS_CLASSES);
