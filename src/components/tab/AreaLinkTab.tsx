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
import {
  DbTrajectory,
  DropdownItemOption,
  HypothesisRowData,
  isTrajectoryConfigurationType,
  RowStatus,
  StudyDTO,
  TrajectoryViewData,
} from '@/shared/types';
import { ImportTrajectoryModal } from '@common/modal/ImportTrajectoryModal.tsx';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { buildReadOnlyRow, buildTableData, getDeletionModalMessage } from '@/shared/utils/trajectoryUtils.ts';
import { TrajectoryDataVisualisation } from '@common/modal/TrajectoryDataVisualisation.tsx';
import { AreaDeletionConfirmationModal } from '@common/modal/AreaDeletionConfirmationModal.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { PegaseHypothesisTable } from '@common/layout/PegaseHypothesisTable/PegaseHypothesisTable.tsx';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { handleViewTrajectory } from '@/shared/services/hypothesisTableService.ts';
import { getParamForFetchFSTrajectory } from '@/shared/helpers/hypothesisTableHelper.ts';
import getEditableHypothesisTableHeaders from '@/components/header/EditableHypothesisTableHeaders.tsx';
import { useFetchFixHypothesisTrajectories } from '@/hooks/useFetchFixHypothesisTrajectories.ts';
import { useTrajectorySearchHandler } from '@/hooks/useTrajectorySearchHandler.ts';
import { useTrajectoryFetchFromFSHandler } from '@/hooks/useTrajectoryFetchFromFSHandler.ts';
import { useHypothesisTableUpdateHandler } from '@/hooks/useHypothesisTableUpdateHandler.ts';
import { updateStudy } from '@/shared/services/studyService.ts';
import { HypothesisType } from '@/shared/types/HypothesisTable.ts';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';

interface AreaLinkTabProps {
  studyData: StudyDTO;
}

export const AreaLinkTab = ({ studyData }: AreaLinkTabProps) => {
  const studyState = useStudy();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const dispatch = useStudyDispatch();
  const { t } = useTranslation();
  const [optionsFS, setOptionsFS] = useState<DropdownItemOption[] | undefined>();
  const [rowIdSelected, setRowIdSelected] = useState<string>('0');
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryViewData | undefined>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [data, setData] = useState<HypothesisRowData[]>([]);
  const [settingsData, setSettingsData] = useState<HypothesisRowData[]>([]);
  const [readOnly, setReadOnly] = useState<ReadOnlyObject>({ '0': false, '1': true });
  const [readOnlySettings, setReadOnlySettings] = useState<ReadOnlyObject>({ '0': true, '1': true, '2.0': true, '2.1': true });
  const [dbTrajectories, setDbTrajectories] = useState<DbTrajectory[]>([]);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [selectedTrajectoryType, setSelectedTrajectoryType] = useState<TRAJECTORY_TYPE>(TRAJECTORY_TYPE.AREA);
  const [isStudyGenerated, setIsStudyGenerated] = useState(
    studyState.studyStatus === StudyStatus.GENERATED || studyData?.status === StudyStatus.GENERATED,
  );

  const configs = useMemo(
    () => [[
      { type: TRAJECTORY_TYPE.AREA, labelKey: t('studyDetails.@areas') },
      { type: TRAJECTORY_TYPE.LINK, labelKey: t('studyDetails.@links'), options: {hasHvdcOption: true} },
    ],[
      { type: TRAJECTORY_TYPE.ADEQUACY_PATCH, labelKey: t('settings.@adequacyPatch') },
      { type: TRAJECTORY_TYPE.FLOWBASED, labelKey: t('settings.@flowBased'), options: {hasRecalculateOption: true} },
      { type: TRAJECTORY_TYPE.SETTINGS, labelKey: t('settings.@title'), subRows: [
        { type: TRAJECTORY_TYPE.SETTINGS, labelKey: t('settings.@generalData') },
        { type: TRAJECTORY_TYPE.SCENARIO_BUILDER, labelKey: t('settings.@scenarioBuilder') }]
      },
    ]],
    [t]
  );
  const options = useMemo(
    () => ({
      withReadOnlyRow: true,
    }),
    [],
  );
  const {
    firstTableData,
    firstTableReadOnlyRow,
    secondTableData,
    secondTableReadOnlyRow
  } = useFetchFixHypothesisTrajectories(configs, options, isStudyGenerated, studyData?.id);
  const { fileStatus, progress, importTrajectory } = useTrajectoryImport(studyData, dispatch);
  const { handleSearch } = useTrajectorySearchHandler({
    studyHorizon: studyData.horizon,
    setDbTrajectories,
  });
  const { handleFetchFromFS } = useTrajectoryFetchFromFSHandler();
  const { handleHypothesisTableUpdate } = useHypothesisTableUpdateHandler({
    studyData,
    setRowIdSelected,
    setIsDeletionModalOpen,
    dbTrajectories
  });

  useEffect(() => {
    firstTableData && setData(firstTableData);
    firstTableReadOnlyRow && setReadOnly(firstTableReadOnlyRow);
    secondTableData && setSettingsData(secondTableData);
    secondTableReadOnlyRow && setReadOnlySettings(secondTableReadOnlyRow);
  }, [firstTableData, firstTableReadOnlyRow, secondTableReadOnlyRow, studyData.id, secondTableData]);

  useEffect(() => {
    if (studyState.studyStatus === StudyStatus.GENERATED) {
      setIsStudyGenerated(true);
      setReadOnly(buildReadOnlyRow(['0', '1']));
      if (configs[1]) {
        setReadOnlySettings(buildReadOnlyRow(['0', '1', '2.0', '2.1']));
      }
    }
  }, [configs, studyState.studyStatus]);

  const handleSelectionChange = useCallback(
    async (fileNameContains: string, rowId: string, type: TRAJECTORY_TYPE) => {
      const indexArray = rowId.split('.').map(Number);
      return await handleSearch(type, indexArray, { fileNameContains });
    },
    [handleSearch],
  );

  const handleFetchTrajectoryFromFs = useCallback(async (rowId: string, type: TRAJECTORY_TYPE) => {
    const dataToUse = isTrajectoryConfigurationType(type) ? settingsData : data;
    const { typeToUse, areaToUse, isDefaultArea } = getParamForFetchFSTrajectory(
      type,
      rowId,
      dataToUse,
    );
    setSelectedTrajectoryType(typeToUse);
    const results = await handleFetchFromFS({ typeToUse, areaToUse, isDefaultArea });
    setOptionsFS(results);
    setRowIdSelected(rowId);
    toggleModal();
  }, [data, handleFetchFromFS, settingsData, toggleModal]);

  const handleViewTrajectoryData = useCallback(
    (rowId: string) => {
      const index = Number(rowId);
      const trajectory = data[index].trajectory;
      if (trajectory) {
        void handleViewTrajectory(trajectory, setTrajectoryData, setIsViewModalOpen, t, studyState.areas);
      }
    },
    [data, studyState.areas, t],
  );

  const handleHvdcActivate = useCallback(
    async (value?: boolean, hasFlowbasedTrajectory?: boolean) => {
      if (hasFlowbasedTrajectory && !value) {
        setSelectedTrajectoryType(TRAJECTORY_TYPE.FLOWBASED);
        setIsDeletionModalOpen(true);
      } else {
        await updateStudy({ hvdc: value }, studyData.id);
        setData((prev) => prev.map((item, index) => (index === 1 ? { ...item, hvdc: value } : item)));
        setReadOnlySettings({'0': false, '1': !value && !hasFlowbasedTrajectory, '2.0': false, '2.1': false});
      }
    },
    [studyData.id],
  );

  const handleRecalculateActivate = useCallback(
    async (value?: boolean) => {
      await updateStudy({ recalculate: value }, studyData.id);
      setSettingsData((prev) => prev.map((item, index) => (index === 1 ? { ...item, recalculate: value } : item)));
    },
    [studyData.id],
  );

  const handleConfirmedDeletion = useCallback(async () => {
      if (selectedTrajectoryType === TRAJECTORY_TYPE.FLOWBASED) {
        await handleHypothesisTableUpdate(
          {
            rowId: '1',
            value: null,
            status: 'empty',
            type: TRAJECTORY_TYPE.FLOWBASED,
            data: settingsData,
            setReadOnly,
            setData: setSettingsData,
            setSecondTableReadOnly: setReadOnlySettings,
            shouldUpdateHvdc: true
          }
        );
        setData((prev) => prev.map((item, index) => (index === 1 ? { ...item, hvdc: false } : item)));
      } else if (selectedTrajectoryType === TRAJECTORY_TYPE.AREA && rowIdSelected === '0') {
        await unlinkAllTrajectoriesFromStudy(studyData.id);
        void updateStudy({ hvdc: false }, studyData.id);

        setData(buildTableData(configs[0], t, [], {hvdc: false}));
        dispatch?.({
          type: STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE,
          payload: [TRAJECTORY_TYPE.AREA],
        });
        setReadOnly({ '0': false, '1': true });

        setSettingsData(buildTableData(configs[1], t));
        setReadOnlySettings(buildReadOnlyRow(['0', '1', '2.0', '2.1']));
      } else {
        await handleHypothesisTableUpdate(
          {
            rowId: '1',
            value: null,
            status: 'empty',
            type: TRAJECTORY_TYPE.LINK,
            data,
            setData,
            setReadOnly,
            setSecondTableReadOnly: setReadOnlySettings,
            secondData: settingsData,
            setSecondData: setSettingsData,
            shouldUpdateHvdc: studyData.hvdc
          }
        );
      }
      setIsDeletionModalOpen(false);
  }, [configs, data, dispatch, handleHypothesisTableUpdate, rowIdSelected, selectedTrajectoryType, settingsData, studyData.hvdc, studyData.id, t]);

  return (
    <div className="flex w-full flex-col gap-6 items-start">
      <div className="flex w-full flex-col gap-2 items-start">
        <div className="text-heading-xs font-medium">{t('studyDetails.@areas_links')}</div>
          <PegaseHypothesisTable
            id="area-link-table"
            columnHeader={t('studyDetails.@hypothesis')}
            data={data}
            getTableHeaders={getEditableHypothesisTableHeaders}
            fileStatus={fileStatus}
            isStudyGenerated={isStudyGenerated}
            readOnly={readOnly}
            isReadOnlyEnable={true}
            progress={isTrajectoryConfigurationType(selectedTrajectoryType) ? 0 : progress}
            idSelected={String(rowIdSelected)}
            handleSearch={async (fileNameContains: string, rowId: string) => await handleSelectionChange(fileNameContains, rowId, TRAJECTORY_TYPE.AREA)}
            updateData={async (rowId: string, value: unknown, status: RowStatus) => {
              if (status === 'empty' && rowId === '1' && settingsData?.[1]?.status === TRAJECTORY_SELECTION_STATUS.OK) {
                setSelectedTrajectoryType(TRAJECTORY_TYPE.LINK);
                setRowIdSelected(rowId);
                setIsDeletionModalOpen(true);
              } else {
                setSelectedTrajectoryType(TRAJECTORY_TYPE.AREA);
                await handleHypothesisTableUpdate(
                  {
                    rowId,
                    value,
                    status,
                    type: TRAJECTORY_TYPE.AREA,
                    data,
                    setData,
                    setReadOnly,
                    setSecondTableReadOnly: setReadOnlySettings
                  }
                )
               }
            }}
            handleImport={async (rowId: string) => await handleFetchTrajectoryFromFs(rowId, TRAJECTORY_TYPE.AREA)}
            handleViewData={handleViewTrajectoryData}
            activate={async (value?: boolean | string) => await handleHvdcActivate(value as boolean, !!settingsData?.[1]?.trajectory?.trajectoryName?.length && settingsData?.[1]?.status === TRAJECTORY_SELECTION_STATUS.OK)}
            type={TRAJECTORY_TYPE.AREA}
          />
      </div>
      <div className="flex w-full flex-col gap-2 items-start">
        <div className="text-heading-xs font-medium">{t('studyDetails.@configuration')}</div>
          <PegaseHypothesisTable
            id="settings-table"
            columnHeader={t('studyDetails.@hypothesis')}
            data={settingsData}
            getTableHeaders={getExpandableHypothesisTableHeaders}
            fileStatus={fileStatus}
            hasLinkTrajectory={!!data?.[1]?.trajectory?.trajectoryName?.length && data?.[1]?.status === TRAJECTORY_SELECTION_STATUS.OK}
            isHvdcActivated={data?.[1]?.hvdc}
            isStudyGenerated={isStudyGenerated}
            readOnly={readOnlySettings}
            isReadOnlyEnable={true}
            progress={isTrajectoryConfigurationType(selectedTrajectoryType) ? progress : 0}
            idSelected={String(rowIdSelected)}
            handleSearch={async (fileNameContains: string, rowId: string) => {
              setSelectedTrajectoryType(TRAJECTORY_TYPE.ADEQUACY_PATCH);
              return await handleSelectionChange(fileNameContains, rowId, TRAJECTORY_TYPE.ADEQUACY_PATCH)
            }}
            updateData={(rowId: string, value: unknown, status: RowStatus) => {
                void handleHypothesisTableUpdate(
                  {
                    rowId,
                    value,
                    status,
                    type: TRAJECTORY_TYPE.ADEQUACY_PATCH,
                    data: settingsData,
                    setReadOnly,
                    setData: setSettingsData,
                    setSecondTableReadOnly: setReadOnlySettings
                  });
            }}
            handleImport={async (rowId: string) => await handleFetchTrajectoryFromFs(rowId, TRAJECTORY_TYPE.ADEQUACY_PATCH)}
            activate={async (value?: boolean | string) => await handleRecalculateActivate(value as boolean)}
            type={TRAJECTORY_TYPE.ADEQUACY_PATCH}
          />
      </div>
        <ImportTrajectoryModal
          options={optionsFS}
          isOpen={isModalOpen}
          onClose={async (
            typeToUse?: TRAJECTORY_TYPE,
            value?: DropdownItemOption,
            hypothesis?: HypothesisType,
            indexArray?: number[],
          ) => {
            toggleModal();
            if (typeToUse) {
              setSelectedTrajectoryType(typeToUse);
              if (value) {
                await importTrajectory(
                  isTrajectoryConfigurationType(typeToUse) ? setSettingsData : setData,
                  value,
                  typeToUse,
                  indexArray,
                  hypothesis,
                  setReadOnly,
                  setReadOnlySettings
                );
              }
            }
          }}
          tabType={selectedTrajectoryType}
          data={isTrajectoryConfigurationType(selectedTrajectoryType) ? settingsData : data}
          rowIdSelected={rowIdSelected}
        />
      {trajectoryData && (
        <TrajectoryDataVisualisation trajectoryData={trajectoryData} onClose={() => setIsViewModalOpen(false)} isOpen={isViewModalOpen}/>
      )}
      <AreaDeletionConfirmationModal
        isOpen={isDeletionModalOpen}
        onClose={() => setIsDeletionModalOpen(false)}
        onConfirm={handleConfirmedDeletion}
        type={selectedTrajectoryType}
        message={t(`${getDeletionModalMessage(selectedTrajectoryType)}`)}
      />
    </div>
  );
};
