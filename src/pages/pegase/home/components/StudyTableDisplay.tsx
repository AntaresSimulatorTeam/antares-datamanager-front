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
import StudiesPagination from './StudiesPagination';

const ITEMS_PER_PAGE = 4;
const BASE_URL = import.meta.env.VITE_BACK_END_BASE_URL;
const columnHelper = createColumnHelper<StudyDTO>();

interface StudyTableDisplayProps {
  searchStudy: string | undefined;
}

interface UseStudyTableDisplayProps {
  searchStudy: string | undefined;
}

interface UseStudyTableDisplayReturn {
  rows: StudyDTO[];
  count: number;
  intervalSize: number;
  current: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export const useStudyTableDisplay = ({ searchStudy }: UseStudyTableDisplayProps): UseStudyTableDisplayReturn => {
  const [rows, setRows] = useState<StudyDTO[]>([]);
  const [count, setCount] = useState(0);
  const [current, setCurrent] = useState(0);
  const intervalSize = ITEMS_PER_PAGE;

  useEffect(() => {
    setCurrent(0);
    setCount(0);
  }, [searchStudy]);

  useEffect(() => {
    fetch(BASE_URL + `/v1/study/search?page=${current + 1}&size=${intervalSize}&search=${searchStudy}`)
      .then((response) => response.json())
      .then((json) => {
        setRows(json.content);
        setCount(json.totalElements);
      })
      .catch((error) => console.error(error));
  }, [current, searchStudy]);

  return { rows, count, intervalSize, current, setPage: setCurrent };
};

const StudyTableDisplay = ({ searchStudy }: StudyTableDisplayProps) => {
  const { t } = useTranslation();

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
  const { rows, count, intervalSize, current, setPage } = useStudyTableDisplay({ searchStudy });

  return (
    <div>
      <div className="h-60vh overflow-auto">
        <StdSimpleTable columns={headers} data={rows} />
      </div>
      <div className="flex h-[60px] w-[1168px] flex-shrink-0 items-center justify-between bg-gray-200 px-[32px]">
        <StudiesPagination count={count} intervalSize={intervalSize} current={current} onChange={setPage} />
      </div>
    </div>
  );
};

export default StudyTableDisplay;
