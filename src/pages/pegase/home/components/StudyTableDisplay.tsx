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
import { StudyStatus } from '@/shared/types/common/StudyStatus.type';
import { useStudyTableDisplay } from './useStudyTableDisplay';
import { useTranslation } from 'react-i18next';
import StudyCreationModal from '../../studies/StudyCreationModal';
import { handleDelete } from '@/pages/pegase/home/components/studyService';
import {RdsButton} from "rte-design-system-react";

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

  // Reload trigger for re-fetching data
  const [reloadStudies, setReloadStudies] = useState<boolean>(false);

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

  // Pass reloadTrigger to refresh data
  const { rows, count, intervalSize, current, setPage } = useStudyTableDisplay({
    searchStudy,
    projectId,
    sortBy: sortByState,
    reloadStudies, // Key change here
  });

  const selectedRowId = Object.keys(rowSelection)[0];

  const selectedStatus = rows[Number.parseInt(selectedRowId || '-1')]?.status?.toUpperCase();

  const isDuplicateActive = selectedStatus === StudyStatus.GENERATED;
  const isDeleteActive = selectedStatus === StudyStatus.ERROR || selectedStatus === StudyStatus.IN_PROGRESS;

  const handleDuplicate = () => {
    const selectedStudy = rows[Number.parseInt(selectedRowId || '-1')];
    setSelectedStudy(selectedStudy);
    toggleModal();
    setReloadStudies(!reloadStudies); // Trigger reload after deleting
  };

  const handleDeleteClick = () => {
    const selectedStudyId = rows[Number.parseInt(selectedRowId || '-1')]?.id;
    if (selectedStudyId) {
      handleDelete(selectedStudyId).then(() => {
        setReloadStudies(!reloadStudies); // Trigger reload after deleting
      });
    }
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
              <RdsButton label="Duplicate" onClick={handleDuplicate} variant="outlined" disabled={!isDuplicateActive} />
              <RdsButton
                label="Delete"
                onClick={handleDeleteClick}
                variant="outlined"
                color="danger"
                disabled={!isDeleteActive}
              />
            </>
          ) : (
            <RdsButton label={t('home.@new_study')} onClick={toggleModal} />
          )}
          {isModalOpen && (
            <StudyCreationModal
              isOpen={isModalOpen}
              onClose={toggleModal}
              study={selectedStudy}
              setReloadStudies={setReloadStudies} // Pass setReloadStudies
            />
          )}
        </div>
        <StudiesPagination count={count} intervalSize={intervalSize} current={current} onChange={setPage} />
      </div>
    </div>
  );
};

export default StudyTableDisplay;
