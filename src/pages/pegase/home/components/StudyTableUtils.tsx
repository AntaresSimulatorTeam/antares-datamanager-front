/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdIcon from '@/components/common/base/stdIcon/StdIcon';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { useState } from 'react';

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
                  <span className="font-bold text-primary-600">
                    <StdIcon name={StdIconId.ArrowUpwardAlt} />
                  </span>
                ) : (
                  <span className="font-bold text-primary-600">
                    <StdIcon name={StdIconId.ArrowDownwardAlt} />
                  </span>
                )
              ) : (
                <span
                  className={`text-primary-900 ${
                    isHeaderHovered ? 'opacity-100' : 'opacity-0'
                  } transition-opacity duration-100`}
                >
                  <StdIcon name={StdIconId.ArrowUpwardAlt} />
                </span>
              )}
            </div>
          )}
        </div>
      ),
    };
  });
}

export function useNewStudyModal() {
  const [isModalOpen, setModalOpen] = useState(false);

  const toggleModal = () => {
    setModalOpen((prev) => !prev);
  };

  return {
    isModalOpen,
    toggleModal,
  };
}
