/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import StdSimpleTable from '@/components/common/data/stdSimpleTable/StdSimpleTable';
import { useState } from 'react';
import { StudyDTO } from '@/shared/types/index';
import StudiesPagination from './StudiesPagination';
import { useStudyTableDisplay } from './useStudyTableDisplay';
import getStudyTableHeaders from './StudyTableHeaders';
import { addSortColumn, renderButtons } from './StudyTableUtils';

interface StudyTableDisplayProps {
  searchStudy: string | undefined;
  projectId?: string;
}

const StudyTableDisplay = ({ searchStudy, projectId }: StudyTableDisplayProps) => {
  const [sortBy, setSortBy] = useState<{ [key: string]: 'asc' | 'desc' }>({});
  const [selectedRows, setSelectedRows] = useState<StudyDTO[]>([]);

  const handleSort = (column: string) => {
    const newSortOrder = sortBy[column] === 'asc' ? 'desc' : 'asc';
    setSortBy({ [column]: newSortOrder });
    setSortedColumn(column);
  };
  const [sortedColumn, setSortedColumn] = useState<string | null>('status');

  const headers = getStudyTableHeaders();

  const [isHeaderHovered, setIsHeaderHovered] = useState<boolean>(false);

  const handleHeaderHover = (hovered: boolean) => {
    setIsHeaderHovered(hovered);
  };

  const handleRowSelectionChange = (selectedIds: any) => {
    console.log('Selected IDs:', selectedIds); // Log to check the value of selectedIds
    if (Array.isArray(selectedIds)) {
      const newSelectedRows = rows.filter((row) => selectedIds.includes(row.id.toString()));
      console.log('Selected Rows:', newSelectedRows);
      setSelectedRows(newSelectedRows);
    } else {
      console.error('Expected selectedIds to be an array');
    }
  };

  const { rows, count, intervalSize, current, setPage } = useStudyTableDisplay({ searchStudy, projectId, sortBy });
  const sortedHeaders = addSortColumn(headers, handleSort, sortBy, sortedColumn, handleHeaderHover, isHeaderHovered);

  return (
    <div>
      <div className="flex-1">
        <StdSimpleTable columns={sortedHeaders} data={rows as StudyDTO[]} enableRowSelection={true} />
      </div>
      <div className="flex h-[60px] items-center justify-between bg-gray-200 px-[32px]">
        {renderButtons(selectedRows)}
        <StudiesPagination count={count} intervalSize={intervalSize} current={current} onChange={setPage} />
      </div>
    </div>
  );
};

export default StudyTableDisplay;
