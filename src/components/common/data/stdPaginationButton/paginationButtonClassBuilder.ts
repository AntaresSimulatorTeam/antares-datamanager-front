/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { clsx } from 'clsx';

export const BUTTON_CLASSES =
  'min-w-3 box-border rounded text-heading-s font-semibold hover:bg-primary-50 focus:outline focus:outline-1 focus:outline-offset-0 focus:outline-primary-900 active:bg-primary-100';

export const COMMON_NUMBER_CLASSES = 'flex items-center justify-center';

export const NUMBER_CLASSES = {
  default: 'h-3 px-0.5',
  active: 'mx-0.25 mt-0.5 h-2.5 border-b-2 border-primary-600 px-0.25 pb-0.25',
};

export const paginationButtonClassBuilder = (active: boolean): { buttonClasses: string; numberClasses: string } => ({
  buttonClasses: BUTTON_CLASSES,
  numberClasses: clsx(COMMON_NUMBER_CLASSES, active ? NUMBER_CLASSES.active : NUMBER_CLASSES.default),
});
