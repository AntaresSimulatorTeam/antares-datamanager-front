/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import StdAvatar from '@/components/common/layout/stdAvatar/StdAvatar';

import StdTagList from '@/components/common/base/StdTagList/StdTagList';
import StdSimpleTable from '@/components/common/data/stdSimpleTable/StdSimpleTable';
import './Study.css';
import { createColumnHelper } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
const columnHelper = createColumnHelper<StudyDTO>();
interface StudyTableDisplayProps {
  searchStudy: (value?: string) => void;
}

const StudyTableDisplay: React.FC<StudyTableDisplayProps> = ({ searchStudy }) => {
  const [rows, setRows] = useState<StudyDTO[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 3;
  const headers = [
    columnHelper.accessor('study_name', { header: 'Nom Étude' }),
    columnHelper.accessor('user_name', {
      header: 'user_name',
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
    fetch(`http://localhost:8093/v1/study/search?page=${currentPage}&size=${itemsPerPage}&search=${searchStudy}`)
      .then((response) => response.json())
      .then((json) => {
        setRows(json.content);
        setTotalPages(Math.ceil(json.totalElements / itemsPerPage));
      })
      .catch((error) => console.error(error));
  }, [currentPage, searchStudy]);

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="h-60vh overflow-auto">
      <StdSimpleTable columns={headers} data={rows} />
      <button className={`button-spacing ${currentPage === 0 ? 'hide-button' : ''}`} onClick={handlePrevious}>
        {' '}
        Précédent
      </button>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages - 1}
        className={`button-spacing ${currentPage === totalPages - 1 ? 'hide-button' : ''}`}
      >
        Suivant
      </button>
      <span className="button-spacing">
        Page {currentPage + 1} of {totalPages}
      </span>
    </div>
  );
};

export default StudyTableDisplay;
