/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import clsx from 'clsx';

export const STRIPED_CLASSES = 'even:bg-primary-200';
export const SELECTED_ROW_CLASSES = 'bg-gray-100';
export const EXPANDABLE_ROW_CLASSES = 'border-l-2 border-l-gray-400';
export const READONLY_ROW_CLASSES =
  'pointer-events-none bg-gray-300 border-l-gray-400 [&_div]:text-gray-600 [&_span]:text-gray-600 [&_svg]:text-gray-600';
export const READONLY_SELECTED_ROW_CLASSES = 'hover:bg-gray-100';

export const tableCoreRowClassBuilder = (
  isStriped?: boolean,
  isSelected?: boolean,
  isReadOnly?: boolean,
  isExpandable?: boolean,
  parentRowCanExpand?: boolean,
  trClassNames?: string,
) =>
  clsx(
    {
      group: true,
      [STRIPED_CLASSES]: isStriped,
      [SELECTED_ROW_CLASSES]: isSelected || (!isExpandable && parentRowCanExpand),
      [EXPANDABLE_ROW_CLASSES]: isExpandable,
      [READONLY_ROW_CLASSES]: isReadOnly,
      [READONLY_SELECTED_ROW_CLASSES]: !isReadOnly && !isSelected,
    },
    trClassNames,
  );
