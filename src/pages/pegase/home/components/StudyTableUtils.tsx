/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdIcon from '@common/base/stdIcon/StdIcon';

export function addSortColumn(
  headers: any[],
  handleSort: (column: string) => void,
  sortBy: { [key: string]: 'asc' | 'desc' },
  sortedColumn: string | null,
  handleHeaderHover: (hovered: boolean) => void,
  isHeaderHovered: boolean,
) {
  return headers.map((column) => {
    const isSortable = column.accessorKey !== 'keywords' && column.id !== 'radioColumn';
    return {
      ...column,
      header: (
        <div
          className={`flex items-center ${isSortable ? 'cursor-pointer' : ''} header-container group`}
          onMouseEnter={() => isSortable && handleHeaderHover(true)}
          onMouseLeave={() => isSortable && handleHeaderHover(false)}
          onClick={() => {
            if (isSortable) {
              handleHeaderHover(false);
              handleSort(column.accessorKey as string);
            }
          }}
        >
          <div>{column.header}</div>
          {isSortable && (
            <div>
              {sortBy[column.accessorKey as string] && sortedColumn === column.accessorKey ? (
                sortBy[column.accessorKey as string] === 'asc' ? (
                  <StdIcon name={StdIconId.ArrowUpwardAlt} color="primary" />
                ) : (
                  <StdIcon name={StdIconId.ArrowUpwardAlt} color="primary" />
                )
              ) : (
                <span className={`${isHeaderHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
                  <StdIcon name={StdIconId.ArrowUpwardAlt} color="primary" />
                </span>
              )}
            </div>
          )}
        </div>
      ),
    };
  });
}
