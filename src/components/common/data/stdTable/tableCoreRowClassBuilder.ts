/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import clsx from 'clsx';

export const STRIPED_CLASSSES = 'even:bg-primary-200';
export const SELECTED_ROW_CLASSSES = 'bg-primary-100';
export const READONLY_ROW_CLASSSES = 'bg-gray-100';

export const tableCoreRowClassBuilder = (
  isStriped?: boolean,
  isSelected?: boolean,
  isReadOnly?: boolean,
  trClassNames?: string,
) =>
  clsx(
    {
      group: true,
      [STRIPED_CLASSSES]: isStriped,
      [SELECTED_ROW_CLASSSES]: isSelected,
      [READONLY_ROW_CLASSSES]: isReadOnly,
      'hover:bg-gray-100': !isReadOnly && !isSelected,
    },
    trClassNames,
  );
