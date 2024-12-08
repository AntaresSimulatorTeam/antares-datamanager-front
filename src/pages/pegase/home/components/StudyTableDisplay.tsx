/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import StdAvatar from '@/components/common/layout/stdAvatar/StdAvatar';
import StdSimpleTable from '@/components/common/data/stdSimpleTable/StdSimpleTable';
import { createColumnHelper } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StudyDTO } from '@/shared/types/index';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdIcon from '@common/base/stdIcon/StdIcon';
import StudiesPagination from './StudiesPagination';
import StdTagList from '@common/base/StdTagList/StdTagList';
import StdRadioButton from '@/components/common/forms/stdRadioButton/StdRadioButton';
import { useStudyTableDisplay } from './useStudyTableDisplay';

const columnHelper = createColumnHelper<StudyDTO>();

interface StudyTableDisplayProps {
  searchStudy: string | undefined;
  projectId?: string;
}

const StudyTableDisplay = ({ searchStudy, projectId }: StudyTableDisplayProps) => {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<{ [key: string]: 'asc' | 'desc' }>({});

  const handleSort = (column: string) => {
    const newSortOrder = sortBy[column] === 'asc' ? 'desc' : 'asc';
    setSortBy({ [column]: newSortOrder });
    setSortedColumn(column);
  };
  const [sortedColumn, setSortedColumn] = useState<string | null>('status');

  const headers = [
    columnHelper.display({
      id: 'radioColumn',
      header: ({ table }) => (
        <StdRadioButton
          value="headerRadio"
          label="Select All"
          checked={table.getIsAllRowsSelected()}
          onChange={() => table.toggleAllRowsSelected()}
          name="headerRadio"
        />
      ),
      cell: ({ row }) => (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`${row.getIsSelected() ? 'block' : 'hidden group-hover:block'}`}
        >
          <StdRadioButton
            value={row.original.id.toString()}
            label=""
            disabled={!row.getCanSelect()}
            checked={row.getIsSelected()}
            name={`radio-${row.original.id}`}
          />
        </div>
      ),
    }),

    columnHelper.accessor('study_name', {
      header: t('home.@study_name'),
      cell: ({ getValue, row }) => {
        const status = row.original.status;
        const textClass = status === 'GENERATED' ? 'text-primary-900' : 'group-hover:text-green-500';

        return <span className={`transition-colors ${textClass}`}>{getValue()}</span>;
      },
    }),

    columnHelper.accessor('user_name', {
      header: t('home.@user_name'),
      cell: ({ getValue }: { getValue: () => string }) => (
        <StdAvatar size="s" backgroundColor="gray" fullname={getValue()} initials={getValue().substring(0, 2)} />
      ),
    }),
    columnHelper.accessor('project', { header: t('home.@project') }),
    columnHelper.accessor('status', { header: t('home.@status') }),
    columnHelper.accessor('horizon', { header: t('home.@horizon') }),
    columnHelper.accessor('keywords', {
      header: 'keywords',
      minSize: 500,
      size: 500,
      cell: ({ getValue, row }) => (
        <div className="flex h-3 w-32">
          <StdTagList id={`pegase-tags-${row.id}`} tags={getValue()} />
        </div>
      ),
    }),
    columnHelper.accessor('creation_date', { header: t('home.@creation_date') }),
  ];

  const [isHeaderHovered, setIsHeaderHovered] = useState<boolean>(false);

  const handleHeaderHover = (hovered: boolean) => {
    setIsHeaderHovered(hovered);
  };

  function addSortColumn(headers: any[]) {
    return headers.map((column) => {
      const isSortable = column.accessorKey !== 'keywords';
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
                    className={`text-primary-900 ${isHeaderHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}
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
  const { rows, count, intervalSize, current, setPage } = useStudyTableDisplay({ searchStudy, projectId, sortBy });

  return (
    <div>
      <div className="flex-1">
        <StdSimpleTable columns={addSortColumn(headers)} data={rows as StudyDTO[]} enableRowSelection={true} />
      </div>
      <div className="flex h-[60px] items-center justify-between bg-gray-200 px-[32px]">
        <StudiesPagination count={count} intervalSize={intervalSize} current={current} onChange={setPage} />
      </div>
    </div>
  );
};

export default StudyTableDisplay;
