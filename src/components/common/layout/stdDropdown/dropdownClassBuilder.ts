/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { clsx } from 'clsx';

export const COMMON_ELEMENT_CLASSES =
  'flex gap-1 text-body-s text-gray-700 cursor-pointer items-center p-1 mx-0.25 rounded';
export const COMMON_ELEMENT_STATUS_CLASSES =
  'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-900';
export const DISABLED_CLASSES = 'text-gray-500 outline-none';
export const ACTIVE_CLASSES = {
  active: 'bg-primary-50 text-primary-900 hover:bg-primary-100',
  inactive:
    'hover:bg-gray-100 hover:text-gray-800 focus:bg-gray-w focus:outline-1 active:bg-gray-200 active:text-gray-900',
};

export const dropdownElementClassBuilder = (disabled: boolean, active: boolean, additionnalClasses?: string) => {
  if (disabled) {
    return clsx(COMMON_ELEMENT_CLASSES, DISABLED_CLASSES);
  } else {
    const activeKey = active ? 'active' : 'inactive';
    const classes = clsx(COMMON_ELEMENT_CLASSES, COMMON_ELEMENT_STATUS_CLASSES, ACTIVE_CLASSES[activeKey]);
    return additionnalClasses ? clsx(classes, additionnalClasses) : classes;
  }
};
