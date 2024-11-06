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

const ITEMS_PER_PAGE = 6;
const BASE_URL = import.meta.env.VITE_BACK_END_BASE_URL;
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
    fetch(BASE_URL + `/v1/study/search?page=${current + 1}&size=${intervalSize}&search=${searchStudy}`)
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
    setSortBy({ ...sortBy, [column]: newSortOrder });
  };

  const headers = [
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
    columnHelper.accessor('keywords', { header: t('home.@keywords') }),
    columnHelper.accessor('creation_date', { header: t('home.@creation_date') }),
  ];
  function addSortColumn(headers: any[]) {
    return headers.map((column) => ({
      ...column,
      header: (
        <div className="flex items-center" onClick={() => handleSort(column.accessorKey as string)}>
          <div> {column.header}</div>
          <div>
            {sortBy[column.accessorKey as string] ? (
              sortBy[column.accessorKey as string] === 'asc' ? (
                <span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9.2513 8.87435L7.58464 10.541C7.43186 10.6938 7.25477 10.7702 7.05339 10.7702C6.852 10.7702 6.67491 10.6938 6.52214 10.541C6.36936 10.3882 6.29297 10.2112 6.29297 10.0098C6.29297 9.80838 6.36936 9.63129 6.52214 9.47852L9.48047 6.52018C9.63325 6.3674 9.80686 6.29102 10.0013 6.29102C10.1957 6.29102 10.3694 6.3674 10.5221 6.52018L13.4805 9.47852C13.6332 9.63129 13.7096 9.8049 13.7096 9.99935C13.7096 10.1938 13.6332 10.3674 13.4805 10.5202C13.3277 10.673 13.1506 10.7493 12.9492 10.7493C12.7478 10.7493 12.5707 10.673 12.418 10.5202L10.7513 8.87435V14.2493C10.7513 14.4577 10.6784 14.6348 10.5326 14.7806C10.3867 14.9264 10.2096 14.9993 10.0013 14.9993C9.79297 14.9993 9.61589 14.9264 9.47005 14.7806C9.32422 14.6348 9.2513 14.4577 9.2513 14.2493V8.87435Z"
                      fill="#ADC63F"
                    />
                  </svg>
                  <StdIcon name={StdIconId.PushPin} />
                </span>
              ) : (
                <span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9.24915 11.125V5.75C9.24915 5.54167 9.32207 5.36458 9.4679 5.21875C9.61373 5.07292 9.79082 5 9.99915 5C10.2075 5 10.3846 5.07292 10.5304 5.21875C10.6762 5.36458 10.7492 5.54167 10.7492 5.75V11.125L12.4158 9.45833C12.5686 9.30556 12.7457 9.22917 12.9471 9.22917C13.1485 9.22917 13.3255 9.30556 13.4783 9.45833C13.6311 9.61111 13.7075 9.78819 13.7075 9.98958C13.7075 10.191 13.6311 10.3681 13.4783 10.5208L10.52 13.4792C10.3672 13.6319 10.1936 13.7083 9.99915 13.7083C9.80471 13.7083 9.6311 13.6319 9.47832 13.4792L6.51998 10.5208C6.36721 10.3681 6.29429 10.191 6.30123 9.98958C6.30818 9.78819 6.38804 9.61111 6.54082 9.45833C6.6936 9.30556 6.87068 9.22917 7.07207 9.22917C7.27346 9.22917 7.45054 9.30556 7.60332 9.45833L9.24915 11.125Z"
                      fill="#ADC63F"
                    />
                  </svg>
                </span>
              )
            ) : (
              <span className="text-primary-600 opacity-0 hover:opacity-100">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9.2513 8.87435L7.58464 10.541C7.43186 10.6938 7.25477 10.7702 7.05339 10.7702C6.852 10.7702 6.67491 10.6938 6.52214 10.541C6.36936 10.3882 6.29297 10.2112 6.29297 10.0098C6.29297 9.80838 6.36936 9.63129 6.52214 9.47852L9.48047 6.52018C9.63325 6.3674 9.80686 6.29102 10.0013 6.29102C10.1957 6.29102 10.3694 6.3674 10.5221 6.52018L13.4805 9.47852C13.6332 9.63129 13.7096 9.8049 13.7096 9.99935C13.7096 10.1938 13.6332 10.3674 13.4805 10.5202C13.3277 10.673 13.1506 10.7493 12.9492 10.7493C12.7478 10.7493 12.5707 10.673 12.418 10.5202L10.7513 8.87435V14.2493C10.7513 14.4577 10.6784 14.6348 10.5326 14.7806C10.3867 14.9264 10.2096 14.9993 10.0013 14.9993C9.79297 14.9993 9.61589 14.9264 9.47005 14.7806C9.32422 14.6348 9.2513 14.4577 9.2513 14.2493V8.87435Z"
                    fill="#ADC63F"
                  />
                </svg>
              </span>
            )}
          </div>
        </div>
      ),
    }));
  }
  const { rows, count, intervalSize, current, setPage } = useStudyTableDisplay({ searchStudy });

  return (
    <div>
      <div className="flex-1">
        <StdSimpleTable columns={addSortColumn(headers)} data={rows as StudyDTO[]} />
      </div>
      <div className="flex h-[60px] items-center justify-between bg-gray-200 px-[32px]">
        <StudiesPagination count={count} intervalSize={intervalSize} current={current} onChange={setPage} />
      </div>
    </div>
  );
};

export default StudyTableDisplay;
