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

const columnHelper = createColumnHelper<StudyDTO>();

interface StudyTableDisplayProps {
  searchStudy: string | undefined;
}

const StudyTableDisplay: React.FC<StudyTableDisplayProps> = ({ searchStudy }) => {
  const [rows, setRows] = useState<StudyDTO[]>([]);
  const [lastPage, setLastPage] = useState(0);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const BASE_URL = import.meta.env.VITE_BACK_END_BASE_URL;
  const SEARCH_STUDIES_API_URI = import.meta.env.VITE_GET_STUDIES_API;

  const headers = [
    columnHelper.accessor('study_name', { header: 'Nom Étude' }),
    columnHelper.accessor('user_name', {
      header: 'Créateur',
      cell: ({ getValue }) => (
        <StdAvatar size="s" backgroundColor="gray" fullname={getValue()} initials={getValue().substring(0, 2)} />
      ),
    }),
    columnHelper.accessor('project', { header: 'Projet' }),
    columnHelper.accessor('status', { header: 'Status' }),
    columnHelper.accessor('horizon', { header: 'Horizon ' }),
    columnHelper.accessor('keywords', { header: 'mots clés' }),
    columnHelper.accessor('creation_date', { header: 'Date de création' }),
  ];
  useEffect(() => {
    setPage(1);
    setLastPage(0);
  }, [searchStudy]);

  useEffect(() => {
    fetch(BASE_URL + SEARCH_STUDIES_API_URI + `?page=${page}&size=${itemsPerPage}&search=${searchStudy}`)
      .then((response) => response.json())
      .then((json) => {
        setRows(json.content);
        setLastPage(Math.ceil(json.totalElements / itemsPerPage));
      })
      .catch((error) => console.error(error));
  }, [page, searchStudy]);

  return (
    <div className="h-60vh overflow-auto">
      <StdSimpleTable columns={headers} data={rows} />
      <StdPagination lastPage={lastPage} currentPage={page} onChange={setPage} />
    </div>
  );
};

export default StudyTableDisplay;
