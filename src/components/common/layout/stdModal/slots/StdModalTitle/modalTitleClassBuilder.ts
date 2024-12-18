/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { clsx } from 'clsx';
import { StdModalTitleStatus } from './StdModalTitle';

export const COMMON_CONTAINER_CLASSES = 'flex min-w-full max-w-fit items-center gap-1 border-b p-2 h-8';

export const CHILDREN_CLASSES = 'text-heading-s line-clamp-2 grow font-semibold text-left';

export const CONTAINER_STATUS_CLASSES = {
  default: 'border-b-gray-300 bg-gray-100',
  danger: 'border-b-error-600 bg-error-100',
};

export const ICON_STATUS_COLOR_CLASSES = {
  default: 'gray-900',
  danger: 'error-600',
} as const;

export default function modalTitleClassBuilder(status: StdModalTitleStatus) {
  return {
    containerClasses: clsx(COMMON_CONTAINER_CLASSES, CONTAINER_STATUS_CLASSES[status]),
    iconColor: ICON_STATUS_COLOR_CLASSES[status],
    childrenClasses: CHILDREN_CLASSES,
  };
}
