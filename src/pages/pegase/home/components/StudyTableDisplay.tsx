/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import StdSimpleTable from '@/components/common/data/stdSimpleTable/StdSimpleTable';
import { StudyDTO } from '@/shared/types/index';
import getStudyTableHeaders from './StudyTableHeaders';
import { addSortColumn, useNewStudyModal } from './StudyTableUtils';
import StudiesPagination from './StudiesPagination';
import { RowSelectionState } from '@tanstack/react-table';
import StdButton from '@/components/common/base/stdButton/StdButton';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type';
import { useStudyTableDisplay } from './useStudyTableDisplay';
import { useTranslation } from 'react-i18next';
import StudyCreationModal from '../../studies/StudyCreationModal';

interface StudyTableDisplayProps {
  searchStudy: string | undefined;
  projectId?: string;
}

const StudyTableDisplay = ({ searchStudy, projectId }: StudyTableDisplayProps) => {
  const [sortByState, setSortByState] = useState<{ [key: string]: 'asc' | 'desc' }>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sortedColumn, setSortedColumn] = useState<string | null>('status');
  const [isHeaderHovered, setIsHeaderHovered] = useState<boolean>(false);
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const { t } = useTranslation();
  const [selectedStudy, setSelectedStudy] = useState<StudyDTO | null>(null);

  const handleSort = (column: string) => {
    const newSortOrder = sortByState[column] === 'asc' ? 'desc' : 'asc';
    setSortByState({ [column]: newSortOrder });
    setSortedColumn(column);
  };

  const handleHeaderHover = (hovered: boolean) => {
    setIsHeaderHovered(hovered);
  };

  const headers = getStudyTableHeaders();

  const sortedHeaders = addSortColumn(
    headers,
    handleSort,
    sortByState,
    sortedColumn,
    handleHeaderHover,
    isHeaderHovered,
  );

  const { rows, count, intervalSize, current, setPage } = useStudyTableDisplay({
    searchStudy,
    projectId,
    sortBy: sortByState,
  });

  const selectedRowId = Object.keys(rowSelection)[0];

  const selectedStatus = rows[Number.parseInt(selectedRowId || '-1')]?.status?.toUpperCase();

  const isDuplicateActive = selectedStatus === StudyStatus.GENERATED;
  const isDeleteActive = selectedStatus === StudyStatus.ERROR || selectedStatus === StudyStatus.IN_PROGRESS;

  const handleDuplicate = () => {
    const selectedStudy = rows[Number.parseInt(selectedRowId || '-1')];
    setSelectedStudy(selectedStudy);
    toggleModal();
  };

  return (
    <div>
      <div className="flex-1">
        <StdSimpleTable
          columns={sortedHeaders}
          data={rows as StudyDTO[]}
          enableRowSelection={true}
          state={{
            rowSelection,
          }}
          onRowSelectionChange={(
            updaterOrValue: RowSelectionState | ((oldState: RowSelectionState) => RowSelectionState),
          ) => {
            if (typeof updaterOrValue === 'function') {
              setRowSelection((prev: RowSelectionState) => updaterOrValue(prev));
            } else {
              setRowSelection(updaterOrValue);
            }
          }}
        />
      </div>
      <div className="flex h-8 items-center justify-between bg-gray-200 px-4">
        <div className="flex gap-2">
          {selectedRowId !== undefined ? (
            <>
              <StdButton label="Duplicate" onClick={handleDuplicate} variant="outlined" disabled={!isDuplicateActive} />
              <StdButton
                label="Delete"
                onClick={() => console.log('Delete')}
                variant="outlined"
                color="danger"
                disabled={!isDeleteActive}
              />
            </>
          ) : (
            <StdButton label={t('home.@new_study')} onClick={toggleModal} />
          )}
          {isModalOpen && <StudyCreationModal isOpen={isModalOpen} onClose={toggleModal} study={selectedStudy} />}
        </div>
        <StudiesPagination count={count} intervalSize={intervalSize} current={current} onChange={setPage} />
      </div>
    </div>
  );
};

export default StudyTableDisplay;
