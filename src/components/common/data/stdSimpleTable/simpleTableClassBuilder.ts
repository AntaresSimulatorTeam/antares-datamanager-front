/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { classMerger } from '@/shared/utils/common/classes/classMerger';
import { HeaderConfig } from './type/tableType';

export const COMMON_TABLE_CLASSES = 'table-fix w-full';
export const ROW_CLASSES = '[&_tr]:border-b [&_tr]:border-gray-400 [&_tr]:text-body-s';
export const STRIPED_CLASSES = 'even:[&>tr]:bg-primary-200';

export const COMMON_HEADER_CLASSES = 'px-1 py-0.5 text-left font-semibold';

export const rowClassBuilder = <T extends object>(striped: boolean, headers: HeaderConfig<T>[]) => ({
  tableClasses: classMerger(COMMON_TABLE_CLASSES, ROW_CLASSES, striped ? STRIPED_CLASSES : ''),
  headersClasses: headers.reduce(
    (acc, inc) => {
      acc[inc.key] = classMerger(COMMON_HEADER_CLASSES, inc.width ?? '');
      return acc;
    },
    {} as Record<string, string>,
  ),
});
