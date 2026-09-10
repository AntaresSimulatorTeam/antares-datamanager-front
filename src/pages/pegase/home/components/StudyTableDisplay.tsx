/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProjectInfo } from '@/shared/types';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type';
import getStudyTableHeaders from './StudyTableHeaders';
import { addSortColumn } from './StudyTableUtils';
import { RowSelectionState } from '@tanstack/react-table';
import { deleteStudy } from '@/shared/services/studyService';
import StdSimpleTable from '@/components/common/data/stdSimpleTable/StdSimpleTable';
import { useStudyTableDisplay } from '@/hooks/useStudyTableDisplay';
import { useStudyNavigation } from '@/hooks/useStudyNavigation';
import { useTranslation } from 'react-i18next';
import { useNewStudyModal } from '@/hooks/useNewStudyModal';
import StudyCreationModal from '@common/modal/StudyCreationModal';
import StudyModificationModal from '@common/modal/StudyModificationModal.tsx';
import { Button, Pagination } from '@design-system-rte/react';

interface StudyTableDisplayProps {
  searchStudy: string | undefined;
  projectInfo?: ProjectInfo;
}

const StudyTableDisplay = ({ searchStudy, projectInfo }: StudyTableDisplayProps) => {
  const { t } = useTranslation();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isHeaderHovered, setIsHeaderHovered] = useState<boolean>(false);
  // Reload trigger for re-fetching data
  const [reloadStudies, setReloadStudies] = useState<number>(0);
  const [sortBy, setSortBy] = useState<{ [key: string]: 'asc' | 'desc' }>({});
  const [sortedColumn, setSortedColumn] = useState<string | null>('status');
  const [isDuplicateMode, setIsDuplicateMode] = useState(false);
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const [isModalStudyCreation, setIsModalStudyCreation] = useState(false);
  const [page, setPage] = useState<number>(0);
  const { navigateToStudy } = useStudyNavigation();
  const { rows, totalPagesNb } = useStudyTableDisplay({
    searchTerm: searchStudy,
    projectInfo,
    sortBy,
    page,
    reloadStudies
  });

  const selectedStudyId = Object.keys(rowSelection)[0];
  const selectedStudy = useMemo(
    () => (selectedStudyId ? rows.find((r) => r.id?.toString() === selectedStudyId) ?? null : null),
    [rows, selectedStudyId]
  );

  const isDeleteActive = useMemo(() => {
    const status = selectedStudy?.status?.toUpperCase() as StudyStatus | undefined;
    return status === StudyStatus.ERROR || status === StudyStatus.IN_PROGRESS;
  }, [selectedStudy]);

  useEffect(() => {
    !rows?.some((row) => row.status === StudyStatus.IN_PROGRESS) && setRowSelection({});
  }, [rows.length]);

  const headers = useMemo(() => getStudyTableHeaders(t), [t]);

  const handleSort = useCallback((column: string) => {
    const newSortOrder = sortBy[column] === 'asc' ? 'desc' : 'asc';
    setSortBy({ [column]: newSortOrder });
    setSortedColumn(column);
  }, [sortBy]);


  const handleDuplicate = useCallback(() => {
    setIsDuplicateMode(true);
    toggleModal();
    setReloadStudies((prev) => prev + 1);
  }, [toggleModal]);

  const handleDeleteClick = useCallback(async () => {
    try {
      if (selectedStudy?.id) {
        await deleteStudy(Number(selectedStudy.id));
        setReloadStudies((prev) => prev + 1);
      }
    } catch {
      // Silent handler
    }
  }, [selectedStudy?.id]);

  const handleModalClose = useCallback(() => {
    setRowSelection({});
    if (isModalOpen) {
      toggleModal();
    } else {
      setIsModalStudyCreation(false);
    }
    setIsDuplicateMode(false);
  }, [isModalOpen]);

  const sortedHeaders = addSortColumn(headers, handleSort, sortBy, sortedColumn, setIsHeaderHovered, isHeaderHovered);

  return (
    <div className="flex w-fit grow-0 flex-col">
      <div style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        <StdSimpleTable
          columns={sortedHeaders}
          columnSize="rem"
          data={rows}
          getRowId={(row) => row.id?.toString()}
          enableRowSelection={true}
          state={{
            rowSelection,
          }}
          onRowSelectionChange={setRowSelection}
        />
      </div>
      <div className="sticky bottom-0 flex h-8 items-center justify-between bg-gray-200 px-4">
        <div className="flex gap-2">
          {selectedStudy ? (
            <>
              <Button
                label={t('study.@open')}
                onClick={() => void navigateToStudy(selectedStudy)}
                variant="secondary"
              />
              <Button label={t('study.@duplicate')} onClick={handleDuplicate} variant="secondary" />
              <Button
                label={t('study.@delete')}
                onClick={() => void handleDeleteClick()}
                variant="secondary"
                disabled={!isDeleteActive}
              />
            </>
          ) : (
            projectInfo?.id && (
              <Button
                size="s"
                variant="text"
                label={t('studyModal.@new_study')}
                onClick={() => setIsModalStudyCreation(true)}
              />
            )
          )}
        </div>
        <div className="flex h-9 shrink-0 grow basis-0 items-center justify-end px-4 py-3">
          <Pagination appearance="brand" totalPages={totalPagesNb} activePage={Math.max(0, page + 1)} onPageChange={(pageNb: number) => setPage(Math.max(0, pageNb - 1))} />
        </div>
      </div>
      {!isDuplicateMode && projectInfo?.name && (
        <StudyCreationModal
          isOpen={isModalStudyCreation}
          onClose={handleModalClose}
          study={selectedStudy}
          setReloadStudies={setReloadStudies}
          projectInfoName={projectInfo.name}
        />
      )}
      {isDuplicateMode && selectedStudy && (
        <StudyModificationModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          study={selectedStudy}
          setReloadStudies={setReloadStudies}
          isDuplicateMode={isDuplicateMode}
        />
      )}
    </div>
  );
};
export default StudyTableDisplay;
