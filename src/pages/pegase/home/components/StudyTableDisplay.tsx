/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { ProjectInfo, StudyDTO } from '@/shared/types';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type';
import getStudyTableHeaders from './StudyTableHeaders';
import { addSortColumn } from './StudyTableUtils';
import StudiesPagination from './StudiesPagination';
import { RowSelectionState } from '@tanstack/react-table';
import { deleteStudy } from '@/shared/services/studyService';
import StdSimpleTable from '@/components/common/data/stdSimpleTable/StdSimpleTable';
import { useStudyTableDisplay } from '@/hooks/useStudyTableDisplay';
import { useStudyNavigation } from '@/hooks/useStudyNavigation';
import { useTranslation } from 'react-i18next';
import { useNewStudyModal } from '@/hooks/useNewStudyModal';
import StudyCreationModal from '@common/modal/StudyCreationModal';
import StdButton from '@common/base/stdButton/StdButton';

interface StudyTableDisplayProps {
  searchStudy: string | undefined;
  projectInfo?: ProjectInfo;
}

const StudyTableDisplay = ({ searchStudy, projectInfo }: StudyTableDisplayProps) => {
  const { t } = useTranslation();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isHeaderHovered, setIsHeaderHovered] = useState<boolean>(false);
  const [selectedStudy, setSelectedStudy] = useState<StudyDTO | null>(null);
  // Reload trigger for re-fetching data
  const [reloadStudies, setReloadStudies] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<{ [key: string]: 'asc' | 'desc' }>({});
  const [sortedColumn, setSortedColumn] = useState<string | null>('status');
  console.log('=================== projectInfo', projectInfo);

  const { isModalOpen, toggleModal } = useNewStudyModal();
  const { navigateToStudy } = useStudyNavigation();
  const { rows, count, intervalSize, currentPage, setPage } = useStudyTableDisplay({
    searchTerm: searchStudy,
    projectInfo,
    sortBy,
    reloadStudies, // Key change here
  });

  const handleHeaderHover = (hovered: boolean) => {
    setIsHeaderHovered(hovered);
  };

  const headers = getStudyTableHeaders(t);

  const handleSort = (column: string) => {
    const newSortOrder = sortBy[column] === 'asc' ? 'desc' : 'asc';
    setSortBy({ [column]: newSortOrder });
    setSortedColumn(column);
  };

  const selectedRowId = Object.keys(rowSelection)[0];
  const selectedStatus = rows[Number.parseInt(selectedRowId || '-1')]?.status?.toUpperCase() as StudyStatus;
  const isDuplicateActive = selectedStatus === StudyStatus.GENERATED;
  const isDeleteActive = selectedStatus === StudyStatus.ERROR || selectedStatus === StudyStatus.IN_PROGRESS;

  const handleDuplicate = () => {
    setSelectedStudy(rows[Number.parseInt(selectedRowId || '-1')]);
    toggleModal();
    setReloadStudies(!reloadStudies); // Trigger reload after deleting
  };

  const handleDeleteClick = () => {
    const selectedStudyId = rows[Number.parseInt(selectedRowId || '-1')]?.id;
    if (selectedStudyId) {
      void deleteStudy(selectedStudyId).then(() => {
        setReloadStudies(!reloadStudies); // Trigger reload after deleting
      });
    }
  };

  const handleModalClose = () => {
    setSelectedStudy(null);
    setRowSelection({});
    toggleModal();
  };

  const sortedHeaders = addSortColumn(headers, handleSort, sortBy, sortedColumn, handleHeaderHover, isHeaderHovered);

  return (
    <div>
      <div className="flex-1">
        <StdSimpleTable
          columns={sortedHeaders}
          data={rows}
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
              <StdButton
                label={t('study.@open')}
                onClick={() => void navigateToStudy(rows[Number.parseInt(selectedRowId || '-1')])}
                variant="outlined"
              />
              <StdButton
                label={t('study.@duplicate')}
                onClick={handleDuplicate}
                variant="outlined"
                disabled={!isDuplicateActive}
              />
              <StdButton
                label={t('study.@delete')}
                onClick={handleDeleteClick}
                variant="outlined"
                disabled={!isDeleteActive}
              />
            </>
          ) : (
            projectInfo?.id !== '' && <StdButton label={t('studyModal.@new_study')} onClick={toggleModal} />
          )}
        </div>
        <StudiesPagination count={count} intervalSize={intervalSize} current={currentPage} onChange={setPage} />
      </div>
      {isModalOpen && (
        <StudyCreationModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          study={selectedStudy}
          setReloadStudies={setReloadStudies}
          projectInfoName={projectInfo?.name}
        />
      )}
    </div>
  );
};
export default StudyTableDisplay;
