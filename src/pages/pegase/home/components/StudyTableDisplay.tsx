/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import StdSimpleTable from '@/components/common/data/stdSimpleTable/StdSimpleTable';
import { useState } from 'react';
import { StudyDTO } from '@/shared/types/index';
import getStudyTableHeaders from './StudyTableHeaders';
import { addSortColumn } from './StudyTableUtils';
import StudiesPagination from './StudiesPagination';
import { RowSelectionState } from '@tanstack/react-table';
import StdButton from '@/components/common/base/stdButton/StdButton';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type';
import { useStudyTableDisplay } from './useStudyTableDisplay';

interface StudyTableDisplayProps {
  searchStudy: string | undefined;
  projectId?: string;
}

const StudyTableDisplay = ({ searchStudy, projectId }: StudyTableDisplayProps) => {
  const [sortByState, setSortByState] = useState<{ [key: string]: 'asc' | 'desc' }>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sortedColumn, setSortedColumn] = useState<string | null>('status');
  const [isHeaderHovered, setIsHeaderHovered] = useState<boolean>(false);

  const handleSort = (column: string) => {
    const newSortOrder = sortByState[column] === 'asc' ? 'desc' : 'asc';
    setSortByState({ [column]: newSortOrder });
    setSortedColumn(column);
  };
  const handleHeaderHover = (hovered: boolean) => {
    setIsHeaderHovered(hovered);
  };

  const { rows, count, intervalSize, current, setPage } = useStudyTableDisplay({
    searchStudy,
    projectId,
    sortBy: sortByState,
  });

  const headers = getStudyTableHeaders();

  const sortedHeaders = addSortColumn(
    headers,
    handleSort,
    sortByState,
    sortedColumn,
    handleHeaderHover,
    isHeaderHovered,
  );

  const selectedRowId = Object.keys(rowSelection)[0];

  const selectedStatus = rows[Number.parseInt(selectedRowId || '-1')]?.status?.toUpperCase();

  const isDuplicateActive = selectedStatus === StudyStatus.GENERATED;
  const isDeleteActive = selectedStatus === StudyStatus.ERROR || selectedStatus === StudyStatus.IN_PROGRESS;

  return (
    <div>
      <div className="flex-1">
        <StdSimpleTable
          columns={sortedHeaders}
          data={rows as StudyDTO[]}
          enableRowSelection={true}
          hasMainColumnGroup
          state={{
            rowSelection,
          }}
          onRowSelectionChange={(
            updaterOrValue: RowSelectionState | ((oldState: RowSelectionState) => RowSelectionState),
          ) => {
            if (typeof updaterOrValue === 'function') {
              // Handle updater function
              setRowSelection((prev: RowSelectionState) => updaterOrValue(prev));
            } else {
              // Handle direct value
              setRowSelection(updaterOrValue);
            }
          }}
        />
      </div>
      <div className="flex h-8 items-center justify-between bg-gray-200 px-4">
        <div className="flex gap-2">
          {selectedRowId !== undefined ? (
            <>
              <StdButton
                label="Duplicate"
                onClick={() => console.log('duplicate')}
                variant="outlined"
                disabled={!isDuplicateActive}
              />
              <StdButton
                label="Delete"
                onClick={() => console.log('Delete')}
                variant="outlined"
                color="danger"
                disabled={!isDeleteActive}
              />
            </>
          ) : (
            <StdButton label="NewStudy" onClick={() => console.log('NewStudy')} />
          )}
        </div>
        <StudiesPagination count={count} intervalSize={intervalSize} current={current} onChange={setPage} />
      </div>
    </div>
  );
};

export default StudyTableDisplay;
