/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useTranslation } from 'react-i18next';
import { unlinkAllTrajectoriesFromStudy } from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { DbTrajectory, HypothesisRowData, SelectOption, StudyDTO, TrajectoryViewData } from '@/shared/types';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { filterRow } from '@/shared/utils/trajectoryUtils.ts';
import { TrajectoryDataVisualisation } from '@common/modal/TrajectoryDataVisualisation.tsx';
import { AreaDeletionConfirmationModal } from '@common/modal/AreaDeletionConfirmationModal.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { handleViewTrajectory } from '@/shared/services/hypothesisTableService.ts';
import { getReadOnlyForGeneratedStudy } from '@/shared/helpers/hypothesisTableHelper.ts';
import getEditableHypothesisTableHeaders from '@/components/header/EditableHypothesisTableHeaders.tsx';
import { useFetchFixHypothesisTrajectories } from '@/hooks/useFetchFixHypothesisTrajectories.ts';
import { useTrajectorySearchHandler } from '@/hooks/useTrajectorySearchHandler.ts';
import { useTrajectoryFetchFromFSHandler } from '@/hooks/useTrajectoryFetchFromFSHandler.ts';
import { useHypothesisTableUpdateHandler } from '@/hooks/useHypothesisTableUpdateHandler.ts';
import { updateStudy } from '@/shared/services/studyService.ts';
import { convertToOneYearHorizon } from '@/shared/utils/textUtils.ts';

interface AreaLinkTabProps {
  studyData: StudyDTO;
}

export const AreaLinkTab = ({ studyData }: AreaLinkTabProps) => {
  const studyState = useStudy();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();
  const [optionsFS, setOptionsFS] = useState<SelectOption[] | undefined>();
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryViewData | undefined>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({ '0': false, '1': true });
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [isStudyGenerated, setIsStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || studyData?.status === StudyStatus.GENERATED,
  );

  const configs = [
    { type: TRAJECTORY_TYPE.AREA, labelKey: t('studyDetails.@areas') },
    { type: TRAJECTORY_TYPE.LINK, labelKey: t('studyDetails.@links'), hvdc: studyData.hvdc },
  ];
  const options = { withReadOnlyRow: true, isStudyGenerated };
  const { hypothesisTrajectories, readOnlyRow } = useFetchFixHypothesisTrajectories(configs, options, studyData?.id);
  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(studyData, studyState, dispatch, setReadOnly);
  const { handleSearch } = useTrajectorySearchHandler({
    data,
    type: TRAJECTORY_TYPE.AREA,
    studyData,
    setDbTrajectories,
  });
  const { handleFetchFromFS } = useTrajectoryFetchFromFSHandler({
    defaultAreas: [],
    setOptionsFS,
    setRowIdSelected,
    toggleModal,
  });
  const { handleHypothesisTableUpdate } = useHypothesisTableUpdateHandler({
    studyData,
    data,
    type: TRAJECTORY_TYPE.AREA,
    setData,
    setRowIdSelected,
    setIsDeletionModalOpen,
    dbTrajectories,
    setReadOnly,
  });

  useEffect(() => {
    hypothesisTrajectories && setData(hypothesisTrajectories);
    readOnlyRow && setReadOnly(readOnlyRow);
  }, [hypothesisTrajectories, readOnlyRow, studyData?.id]);

  useEffect(() => {
    if (studyState.studyStatus === StudyStatus.GENERATED) {
      setIsStudyGenerated(true);
      setData((rows) => filterRow(rows));
      const rows = getReadOnlyForGeneratedStudy(data);
      setReadOnly(rows);
    }
  }, [studyState.studyStatus]);

  const handleConfirmedAreaDeletion = useCallback(async () => {
    await unlinkAllTrajectoriesFromStudy(studyData.id);

    dispatch?.({ type: STUDY_ACTION.RESET_STUDY_STATE });
    setData([
      { hypothesis: t('studyDetails.@areas'), trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
      { hypothesis: t('studyDetails.@links'), trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
    ]);

    setReadOnly({ '0': false, '1': true });
    setIsDeletionModalOpen(false);
  }, [dispatch, studyData.id, t]);

  return (
    <div className="flex h-fit w-full">
      <PegaseHypothesisTable
        id="area-link-table"
        columnHeader={t('studyDetails.@hypothesis')}
        data={data}
        getTableHeaders={getEditableHypothesisTableHeaders}
        fileStatus={fileStatus}
        isStudyGenerated={isStudyGenerated}
        readOnly={readOnly}
        isReadOnlyEnable={true}
        progress={progress}
        idSelected={String(rowIdSelected)}
        handleSearch={handleSearch}
        updateData={handleHypothesisTableUpdate}
        handleImport={async (rowId: string) => await handleFetchFromFS(TRAJECTORY_TYPE.AREA, data, rowId)}
        handleViewData={(rowId: string) => {
          const index = Number(rowId);
          const trajectory = data[index].trajectory;
          if (trajectory) {
            void handleViewTrajectory(trajectory, setTrajectoryData, setIsViewModalOpen, t);
          }
        }}
        type={TRAJECTORY_TYPE.AREA}
        activate={() => {
          void updateStudy(
            { ...studyData, horizon: convertToOneYearHorizon(studyData.horizon), hvdc: !studyData.hvdc },
            studyData.id,
          );
        }}
      />
      {isModalOpen && (
        <ImportTrajectoryModal
          options={optionsFS}
          onClose={async (value?: SelectOption) => {
            toggleModal();
            if (value != null) {
              await importTrajectory(
                rowIdSelected === '0' ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK,
                value,
                rowIdSelected,
                data,
                setData,
              );
            }
          }}
          trajectoryType={rowIdSelected === '0' ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK}
        />
      )}
      {isViewModalOpen && trajectoryData && (
        <TrajectoryDataVisualisation trajectoryData={trajectoryData} onClose={() => setIsViewModalOpen(false)} />
      )}
      {isDeletionModalOpen && (
        <AreaDeletionConfirmationModal
          isOpen={isDeletionModalOpen}
          onClose={() => setIsDeletionModalOpen(false)}
          onConfirm={handleConfirmedAreaDeletion}
        />
      )}
    </div>
  );
};
