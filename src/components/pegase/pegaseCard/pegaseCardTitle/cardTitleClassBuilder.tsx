/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { clsx } from 'clsx';

export const COMMON_TITLE_CLASSES = 'text-heading-xs font-semibold text-left ';

export const COMMON_TEXT_CLASS = 'text-ellipsis';

export const CLICKABLE_TITLE_CLASSES =
  'hover:cursor-pointer hover:underline hover:decoration-gray-900 hover:underline-offset-2 focus-visible:outline focus-visible:outline-offset-2 rounded';

export const getLineClamp = (lineClamp?: number) => `line-clamp-${lineClamp ?? 1}`;

export default function cardTitleClassBuilder(lineClamp?: number, isActivable?: boolean) {
  const activableClasses = isActivable ? CLICKABLE_TITLE_CLASSES : getLineClamp(lineClamp);
  const classes = {
    titleClasses: clsx(COMMON_TITLE_CLASSES, activableClasses),
    textClasses: getLineClamp(lineClamp),
  };

  return classes;
}
