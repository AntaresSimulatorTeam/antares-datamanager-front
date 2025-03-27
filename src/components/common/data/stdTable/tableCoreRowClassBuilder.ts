/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import clsx from 'clsx';
import {
  READONLY_ROW_CLASSES,
  READONLY_SELECTED_ROW_CLASSES,
  SELECTED_ROW_CLASSES,
  STRIPED_CLASSES,
} from '@common/data/stdTable/const/TableClasses.ts';

export const tableCoreRowClassBuilder = (
  isStriped?: boolean,
  isSelected?: boolean,
  isReadOnly?: boolean,
  trClassNames?: string,
) =>
  clsx(
    {
      group: true,
      [STRIPED_CLASSES]: isStriped,
      [SELECTED_ROW_CLASSES]: isSelected,
      [READONLY_ROW_CLASSES]: isReadOnly,
      [READONLY_SELECTED_ROW_CLASSES]: !isReadOnly && !isSelected,
    },
    trClassNames,
  );
