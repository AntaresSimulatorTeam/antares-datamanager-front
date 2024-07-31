/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { classMerger } from '@/shared/utils/common/classes/classMerger';
import { SwitchSize } from './StdSwitch';

export const COMMON_BG_CLASSES = 'peer bg-gray-300';

export const ENABLED_BG_CLASSES =
  'peer-checked:bg-primary-600 group-hover:bg-gray-400 group-hover:peer-checked:bg-primary-700 group-active:bg-gray-500 group-active:peer-checked:bg-primary-800';
export const DISABLED_BG_CLASSES = 'cursor-not-allowed peer-checked:bg-primary-100';

export const BG_FOCUS_CLASSES =
  'peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-900 peer-focus-visible:peer-checked:outline-primary-900';

const COMMON_LABEL_CLASSES = 'group relative inline-flex cursor-pointer items-center';
const COMMON_INPUT_CLASSES = 'peer sr-only';

export const COMMON_SLIDE_CLASSES =
  'peer absolute start-[-1px] border-1 box-content border bg-gray-w peer-checked:[&_div]:visible ease-out duration-300 transition-all';
export const ENABLED_SLIDE_UNCHECKED_CLASSES =
  'border-gray-500 group-hover:border-gray-600 group-active:border-gray-700';
export const DISABLED_SLIDE_UNCHECKED_CLASSES = 'border-gray-300 bg-gray-100 cursor-default cursor-not-allowed';

export const ENABLED_SLIDE_CHECKED_CLASSES =
  'text-primary-700 group-hover:peer-checked:text-primary-800 group-active:peer-checked:text-primary-900 group-hover:peer-checked:border-primary-800 group-active:peer-checked:border-primary-900 peer-checked:border-primary-700';
export const DISABLED_SLIDE_CHECKED_CLASSES =
  'peer-checked:border-primary-200 peer-checked:text-primary-200 peer-checked:bg-gray-w cursor-not-allowed';

export const COMMON_CHECK_CONTAINER_CLASSES = 'invisible flex justify-center items-center';

export const BG_CLASSES = {
  small: 'w-4 h-1.5 rounded',
  medium: 'w-5 h-2 rounded-md',
};

export const SLIDE_CLASSES = {
  small: 'rounded peer-checked:translate-x-2.5 shadow-switch-unchecked-small peer-checked:shadow-switch-checked-small',
  medium:
    'rounded-md peer-checked:translate-x-3 shadow-switch-unchecked-medium peer-checked:shadow-switch-checked-medium',
};

export const ICON_CONTAINER_CLASSES = {
  small: 'w-1.5 h-1.5',
  medium: 'w-2 h-2',
};

export const ICON_SIZE: Record<string, number> = {
  small: 12,
  medium: 16,
};

export const switchClassBuilder = (switchSize: SwitchSize, disabled?: boolean) => ({
  labelClasses: COMMON_LABEL_CLASSES,
  inputClasses: COMMON_INPUT_CLASSES,
  backgroundClasses: classMerger(
    COMMON_BG_CLASSES,
    disabled ? DISABLED_BG_CLASSES : ENABLED_BG_CLASSES,
    disabled ? '' : BG_FOCUS_CLASSES,
    BG_CLASSES[switchSize],
  ),
  slideClasses: classMerger(
    COMMON_SLIDE_CLASSES,
    disabled ? DISABLED_SLIDE_UNCHECKED_CLASSES : ENABLED_SLIDE_UNCHECKED_CLASSES,
    disabled ? DISABLED_SLIDE_CHECKED_CLASSES : ENABLED_SLIDE_CHECKED_CLASSES,
    SLIDE_CLASSES[switchSize],
  ),
  iconContainerClasses: classMerger(COMMON_CHECK_CONTAINER_CLASSES, ICON_CONTAINER_CLASSES[switchSize]),
  iconSize: ICON_SIZE[switchSize],
});
