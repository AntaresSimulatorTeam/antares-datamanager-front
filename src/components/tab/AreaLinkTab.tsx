/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useTranslation } from 'react-i18next';
import { unlinkAllTrajectoriesFromStudy } from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { DbTrajectory, HypothesisRowData, SelectOption, StudyDTO, TrajectoryViewData } from '@/shared/types';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { filterRow, getAreaTrajectoryName } from '@/shared/utils/trajectoryUtils.ts';
import { TrajectoryDataVisualisation } from '@common/modal/TrajectoryDataVisualisation.tsx';
import { AreaDeletionConfirmationModal } from '@common/modal/AreaDeletionConfirmationModal.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { handleViewTrajectory } from '@/shared/services/hypothesisTableService.ts';
import { getParamForFetchFSTrajectory, getReadOnlyForGeneratedStudy } from '@/shared/helpers/hypothesisTableHelper.ts';
import getEditableHypothesisTableHeaders from '@/components/header/EditableHypothesisTableHeaders.tsx';
import { useFetchFixHypothesisTrajectories } from '@/hooks/useFetchFixHypothesisTrajectories.ts';
import { useTrajectorySearchHandler } from '@/hooks/useTrajectorySearchHandler.ts';
import { useTrajectoryFetchFromFSHandler } from '@/hooks/useTrajectoryFetchFromFSHandler.ts';
import { useHypothesisTableUpdateHandler } from '@/hooks/useHypothesisTableUpdateHandler.ts';
import { updateStudy } from '@/shared/services/studyService.ts';
import { HypothesisType } from '@/shared/types/HypothesisTable.ts';

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

  const configs = useMemo(
    () => [
      { type: TRAJECTORY_TYPE.AREA, labelKey: t('studyDetails.@areas') },
      { type: TRAJECTORY_TYPE.LINK, labelKey: t('studyDetails.@links'), hvdc: studyState.hvdc },
    ],
    [t, studyState.hvdc],
  );
  const options = useMemo(
    () => ({
      withReadOnlyRow: true,
      isStudyGenerated,
    }),
    [isStudyGenerated],
  );
  const { hypothesisTrajectories, readOnlyRow } = useFetchFixHypothesisTrajectories(configs, options, studyData?.id);
  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(studyData, studyState, dispatch, setReadOnly);
  const { handleSearch } = useTrajectorySearchHandler({
    studyHorizon: studyData.horizon,
    setDbTrajectories,
  });
  const { handleFetchFromFS } = useTrajectoryFetchFromFSHandler();
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

  const handleSelectionChange = useCallback(
    async (fileNameContains: string, rowId: string) => {
      const indexArray = rowId.split('.').map(Number);
      return await handleSearch(TRAJECTORY_TYPE.AREA, indexArray, { fileNameContains });
    },
    [handleSearch],
  );

  const handleFetchFromFs = useCallback(async (rowId: string) => {
    const hypothesis = getAreaTrajectoryName(rowId, data);
    const { typeToUse, areaToUse, isDefaultArea } = getParamForFetchFSTrajectory(
      TRAJECTORY_TYPE.AREA,
      rowId.split('.').map(Number),
      data.length,
      hypothesis,
    );
    const results = await handleFetchFromFS({ typeToUse, areaToUse, isDefaultArea });
    setOptionsFS(results);
    setRowIdSelected(rowId);
    toggleModal();
  }, []);

  const handleViewTrajectoryData = useCallback(
    (rowId: string) => {
      const index = Number(rowId);
      const trajectory = data[index].trajectory;
      if (trajectory) {
        void handleViewTrajectory(trajectory, setTrajectoryData, setIsViewModalOpen, t);
      }
    },
    [data, t],
  );

  const handleActivate = useCallback(() => {
    void updateStudy({ hvdc: !studyData.hvdc }, studyData.id);
    setData((prev) => prev.map((item, index) => (index === 1 ? { ...item, hvdc: !item.hvdc } : item)));
    dispatch?.({ type: STUDY_ACTION.SET_STUDY_HVDC, payload: !studyData.hvdc });
  }, [dispatch]);

  const handleConfirmedAreaDeletion = useCallback(async () => {
    await unlinkAllTrajectoriesFromStudy(studyData.id);
    void updateStudy({ hvdc: false }, studyData.id);

    setData([
      { hypothesis: t('studyDetails.@areas'), trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
      {
        hypothesis: t('studyDetails.@links'),
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        hvdc: false,
      },
    ]);
    dispatch?.({ type: STUDY_ACTION.SET_STUDY_HVDC, payload: false });
    dispatch?.({
      type: STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE,
      payload: [TRAJECTORY_TYPE.AREA],
    });

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
        handleSearch={handleSelectionChange}
        updateData={handleHypothesisTableUpdate}
        handleImport={handleFetchFromFs}
        handleViewData={handleViewTrajectoryData}
        activate={handleActivate}
        type={TRAJECTORY_TYPE.AREA}
      />
      {isModalOpen && (
        <ImportTrajectoryModal
          options={optionsFS}
          onClose={async (
            typeToUse?: TRAJECTORY_TYPE,
            value?: SelectOption,
            hypothesis?: HypothesisType,
            indexArray?: number[],
          ) => {
            toggleModal();
            await importTrajectory(setData, value, typeToUse, indexArray, hypothesis);
          }}
          tabType={TRAJECTORY_TYPE.AREA}
          hypothesis={getAreaTrajectoryName(rowIdSelected, data)}
          indexArray={rowIdSelected?.split('.').map(Number)}
          rowsNb={data.length}
        />
      )}
      {isViewModalOpen && trajectoryData && (
        <TrajectoryDataVisualisation trajectoryData={trajectoryData} onClose={() => setIsViewModalOpen(false)} />
      )}
      <AreaDeletionConfirmationModal
        isOpen={isDeletionModalOpen}
        onClose={() => setIsDeletionModalOpen(false)}
        onConfirm={handleConfirmedAreaDeletion}
      />
    </div>
  );
};
