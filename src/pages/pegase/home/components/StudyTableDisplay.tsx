/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import StdAvatar from '@/components/common/layout/stdAvatar/StdAvatar';
import StdSimpleTable from '@/components/common/data/stdSimpleTable/StdSimpleTable';
import { createColumnHelper } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import StdPagination from '@common/data/stdPagination/StdPagination';
import { useTranslation } from 'react-i18next';
import { StudyDTO } from '@/shared/types/index';

const itemsPerPage = 4;
const BASE_URL = import.meta.env.VITE_BACK_END_BASE_URL;
const columnHelper = createColumnHelper<StudyDTO>();

//table raws hook
interface StudyTableDisplayProps {
  searchStudy: string | undefined;
}

interface UseStudyTableDisplayProps {
  searchStudy: string | undefined;
}

interface UseStudyTableDisplayReturn {
  rows: StudyDTO[];
  lastPage: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export const useStudyTableDisplay = ({ searchStudy }: UseStudyTableDisplayProps): UseStudyTableDisplayReturn => {
  const [rows, setRows] = useState<StudyDTO[]>([]);
  const [lastPage, setLastPage] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    setLastPage(0);
  }, [searchStudy]);

  useEffect(() => {
    fetch(BASE_URL + `/v1/study/search?page=${page}&size=${itemsPerPage}&search=${searchStudy}`)
      .then((response) => response.json())
      .then((json) => {
        setRows(json.content);
        setLastPage(Math.ceil(json.totalElements / itemsPerPage));
      })
      .catch((error) => console.error(error));
  }, [page, searchStudy]);

  return { rows, lastPage, page, setPage };
};

const StudyTableDisplay = ({ searchStudy }: StudyTableDisplayProps) => {
  const { t } = useTranslation();

  const headers = [
    columnHelper.accessor('study_name', { header: t('home.@study_name') }),
    columnHelper.accessor('user_name', {
      header: t('home.@user_name'),
      cell: ({ getValue }) => (
        <StdAvatar size="s" backgroundColor="gray" fullname={getValue()} initials={getValue().substring(0, 2)} />
      ),
    }),
    columnHelper.accessor('project', { header: t('home.@project') }),
    columnHelper.accessor('status', { header: t('home.@status') }),
    columnHelper.accessor('horizon', { header: t('home.@horizon') }),
    columnHelper.accessor('keywords', { header: t('home.@keywords') }),
    columnHelper.accessor('creation_date', { header: t('home.@creation_date') }),
  ];
  const { rows, lastPage, page, setPage } = useStudyTableDisplay({ searchStudy });

  return (
    <div className="h-60vh overflow-auto">
      <StdSimpleTable columns={headers} data={rows} />
      <StdPagination lastPage={lastPage} currentPage={page} onChange={setPage} />
    </div>
  );
};

export default StudyTableDisplay;
