/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import StdAvatar from '@/components/common/layout/stdAvatar/StdAvatar';
import StdSimpleTable from '@/components/common/data/stdSimpleTable/StdSimpleTable';
import { createColumnHelper } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StudyDTO } from '@/shared/types/index';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdIcon from '@common/base/stdIcon/StdIcon';
import StudiesPagination from './StudiesPagination';
import StdTagList from '@common/base/StdTagList/StdTagList';
import { getEnvVariables } from '@/envVariables';
import StdCheckbox from '@/components/common/forms/stdCheckbox/StdCheckbox';

const ITEMS_PER_PAGE = 5;
const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');
const columnHelper = createColumnHelper<StudyDTO>();

interface StudyTableDisplayProps {
  searchStudy: string | undefined;
}

interface UseStudyTableDisplayProps {
  searchStudy: string | undefined;
  sortBy: { [key: string]: 'asc' | 'desc' };
}

interface UseStudyTableDisplayReturn {
  rows: StudyDTO[];
  count: number;
  intervalSize: number;
  current: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export const useStudyTableDisplay = ({
  searchStudy,
  sortBy,
}: UseStudyTableDisplayProps): UseStudyTableDisplayReturn => {
  const [rows, setRows] = useState<StudyDTO[]>([]);
  const [count, setCount] = useState(0);
  const [current, setCurrent] = useState(0);

  const intervalSize = ITEMS_PER_PAGE;

  useEffect(() => {
    setCurrent(0);
    setCount(0);
  }, [searchStudy, sortBy]);

  useEffect(() => {
    const sortParams = Object.entries(sortBy)
      .map(([key, order]) => `${key},${order}`)
      .join('&sort=');
    fetch(
      `${BASE_URL}/v1/study/search?page=${current + 1}&size=${intervalSize}&search=${searchStudy}&sort=${sortParams}`,
    )
      .then((response) => response.json())
      .then((json) => {
        setRows(json.content);
        setCount(json.totalElements);
      })
      .catch((error) => console.error(error));
  }, [current, searchStudy, sortBy]);

  return { rows, count, intervalSize, current, setPage: setCurrent };
};

const StudyTableDisplay = ({ searchStudy }: StudyTableDisplayProps) => {
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
      id: 'checkboxColumn',
      header: ({ table }) => (
        <StdCheckbox
          checked={table.getIsAllRowsSelected()}
          onChange={table.toggleAllRowsSelected}
          name="headerCheckbox"
        />
      ),
      cell: ({ row }) =>
        row.getIsSelected() ? <StdCheckbox checked={row.getIsSelected()} onChange={row.toggleSelected} /> : null, // No checkbox is displayed if the row is not selected
    }),
    columnHelper.accessor('study_name', { header: t('home.@study_name') }),
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
  // Add state to track if any header is hovered
  const [isHeaderHovered, setIsHeaderHovered] = useState<boolean>(false);

  // Update the state when any header is hovered
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
  const { rows, count, intervalSize, current, setPage } = useStudyTableDisplay({ searchStudy, sortBy });

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
